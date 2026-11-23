/**
 * MindDrop 1v1 Rarity Combat Engine + BloxCloud Telemetry
 * Players duel with 100 HP each. Rarer valid answers deal heavier damage;
 * identical answers clash and cancel out; first to 0 HP loses!
 */

const crypto = require('crypto');
const { scoreAnswer, getSpellingSuggestions, getRandomPrompt, pickBotAnswer } = require('./prompts');
const eloStore = require('./eloStore');

const MAX_HP = 200;

const TIER_DAMAGE = {
    INVALID: 0,
    COMMON: 10,
    UNCOMMON: 20,
    RARE: 32,
    LEGENDARY: 46,
};

const BOT_CALLSIGNS = ['Kairo [AI]', 'Valkyrie [AI]', 'Cipher [AI]', 'Nyx [AI]', 'Titan [AI]'];

class DuelCombatEngine {
    constructor() {
        this.duels = new Map(); // code -> duel room
        this.playerRecentPrompts = new Map(); // profileKey -> recent prompt IDs across matches
        this.serverStartTime = Date.now();
        this.jobId = 'mindduel_' + crypto.randomBytes(3).toString('hex');
        this._startBloxCloudTelemetry();
    }

    _startBloxCloudTelemetry() {
        const apiKey = (process.env.BLOXCLOUD_API_KEY || '').trim();
        const baseUrl = (process.env.BLOXCLOUD_URL || 'https://bloxcloud.world').replace(/\/$/, '');
        if (!apiKey) return;

        const sendHeartbeat = async () => {
            let humans = 0;
            for (const d of this.duels.values()) {
                for (const p of d.players) if (!p.isBot) humans++;
            }
            try {
                await fetch(`${baseUrl}/api/v1/telemetry/heartbeat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
                    body: JSON.stringify({
                        jobId: this.jobId,
                        placeId: 'MindDrop_1v1_Combat',
                        engine: 'WEB',
                        playerCount: humans,
                        serverFps: 60,
                        serverMemoryMb: Math.round(process.memoryUsage().rss / (1024 * 1024)),
                        uptimeSeconds: Math.floor((Date.now() - this.serverStartTime) / 1000),
                    }),
                });
            } catch {}
        };
        sendHeartbeat();
        setInterval(sendHeartbeat, 15000).unref();
    }

    _genCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
        return this.duels.has(code) ? this._genCode() : code;
    }

    _buildAiOpponent(playerElo) {
        const aiConfig = eloStore.getAiTierForElo(playerElo);
        const aiElo = Math.max(0, playerElo + Math.floor((Math.random() - 0.5) * 40));
        return {
            id: 'bot_' + crypto.randomBytes(3).toString('hex'),
            side: 'RIGHT',
            name: BOT_CALLSIGNS[Math.floor(Math.random() * BOT_CALLSIGNS.length)],
            isBot: true,
            elo: aiElo,
            rank: eloStore.getRankForElo(aiElo),
            aiTier: aiConfig.label,
            aiSkill: aiConfig.skill,
            aiMinDelay: aiConfig.minDelayMs,
            aiMaxDelay: aiConfig.maxDelayMs,
            hp: MAX_HP,
            maxHp: MAX_HP,
            answer: null,
            lastClash: null,
            ws: null,
        };
    }

    joinOrCreateDuel({ code, mode, ws, name, profileId, isAccount = false }) {
        const cleanName = String(name || '').replace(/[^a-zA-Z0-9 _-]/g, '').trim().slice(0, 16) || 'Fighter';
        const profileKey = String(profileId || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || cleanName.toLowerCase().replace(/\s+/g, '_');
        const profile = eloStore.getProfile(profileKey, cleanName, Boolean(isAccount));
        let duelCode = (code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);

        // Quick Match: find open public 1v1 room with closest ELO (<= 250 ELO diff, or any waiting >= 8s)
        if (mode === 'quick' && !duelCode) {
            const now = Date.now();
            let bestCode = null;
            let bestDiff = Infinity;
            for (const [c, d] of this.duels.entries()) {
                if (d.isPublic && d.state === 'WAITING' && d.players.length === 1) {
                    const host = d.players[0];
                    const diff = Math.abs((host.elo ?? 0) - profile.elo);
                    const waitedMs = now - (d.createdAt || now);
                    if ((diff <= 250 || waitedMs >= 8000) && diff < bestDiff) {
                        bestDiff = diff;
                        bestCode = c;
                    }
                }
            }
            if (bestCode) duelCode = bestCode;
        }
        if (!duelCode) duelCode = this._genCode();

        let duel = this.duels.get(duelCode);
        if (!duel) {
            duel = {
                code: duelCode,
                isPublic: mode === 'quick',
                createdAt: Date.now(),
                state: 'WAITING', // WAITING | FIGHT | CLASH | KO
                round: 0,
                usedPromptIds: [],
                currentPrompt: null,
                roundEndsAt: 0,
                players: [], // max 2 fighters
                timer: null,
            };
            this.duels.set(duelCode, duel);
        }

        if (duel.players.length >= 2) {
            this._send(ws, { type: 'ERROR', message: `Room ${duelCode} is already full (2/2 fighters).` });
            ws.close();
            return;
        }

        const playerId = 'f_' + crypto.randomBytes(4).toString('hex');
        const fighter = {
            id: playerId,
            profileKey,
            isAccount: Boolean(isAccount),
            side: duel.players.length === 0 ? 'LEFT' : 'RIGHT',
            name: cleanName,
            isBot: false,
            elo: profile.elo,
            rank: profile.rank,
            aiTier: null,
            hp: MAX_HP,
            maxHp: MAX_HP,
            answer: null,
            lastClash: null,
            ws,
        };
        duel.players.push(fighter);

        // Instant solo vs ELO-scaled AI mode
        if (mode === 'ai' && duel.players.length === 1) {
            duel.players.push(this._buildAiOpponent(profile.elo));
        }

        this._send(ws, { type: 'DUEL_JOINED', selfId: playerId, snapshot: this._snapshot(duel) });
        this._broadcast(duel, { type: 'DUEL_UPDATE', snapshot: this._snapshot(duel) });

        // Start automatically once 2 fighters are in the arena!
        if (duel.players.length === 2 && duel.state === 'WAITING') {
            duel.timer = setTimeout(() => this._nextRound(duel), 1200);
        }

        ws.on('message', (raw) => {
            let msg;
            try { msg = JSON.parse(raw.toString()); } catch { return; }
            if (!msg || typeof msg.type !== 'string') return;

            if (msg.type === 'SUBMIT_ATTACK' && duel.state === 'FIGHT' && fighter.answer === null && duel.currentPrompt) {
                const rawAnswer = String(msg.answer || '').trim().slice(0, 40);
                if (!rawAnswer) return;
                const result = scoreAnswer(duel.currentPrompt.id, rawAnswer);
                if (!result.valid) {
                    const suggestions = getSpellingSuggestions(duel.currentPrompt.id, rawAnswer);
                    this._send(ws, {
                        type: 'ATTACK_REJECTED',
                        raw: rawAnswer,
                        suggestions,
                        message: `"${rawAnswer}" is not recognized — keep guessing!`,
                    });
                    return;
                }
                fighter.answer = result.matched;
                this._send(ws, {
                    type: 'ATTACK_ACCEPTED',
                    raw: rawAnswer,
                    matched: result.matched,
                    autoCorrected: Boolean(result.autoCorrected),
                    tier: result.tier,
                });
                this._broadcast(duel, { type: 'FIGHTER_READY', playerId, snapshot: this._snapshot(duel) });
                this._checkBothReady(duel);
            } else if (msg.type === 'SUGGEST' && duel.state === 'FIGHT' && fighter.answer === null && duel.currentPrompt) {
                const query = String(msg.query || '').trim().slice(0, 40);
                const items = getSpellingSuggestions(duel.currentPrompt.id, query);
                this._send(ws, { type: 'SUGGESTIONS', query, items });
            } else if (msg.type === 'REMATCH' && duel.state === 'KO') {
                this._rematch(duel);
            }
        });

        ws.on('close', () => {
            duel.players = duel.players.filter(p => p.id !== playerId);
            const humansLeft = duel.players.filter(p => !p.isBot).length;
            if (humansLeft === 0) {
                if (duel.timer) clearTimeout(duel.timer);
                this.duels.delete(duel.code);
            } else {
                if (duel.timer) clearTimeout(duel.timer);
                duel.state = 'WAITING';
                this._broadcast(duel, { type: 'OPPONENT_LEFT', snapshot: this._snapshot(duel) });
            }
        });
    }

    _nextRound(duel) {
        if (duel.players.length < 2) return;
        duel.round++;

        // Avoid repeating questions seen recently by any human player across matches & rematches
        const excludeSet = new Set(duel.usedPromptIds);
        for (const p of duel.players) {
            if (!p.isBot && p.profileKey) {
                const recent = this.playerRecentPrompts.get(p.profileKey) || [];
                for (const id of recent) excludeSet.add(id);
            }
        }
        const prompt = getRandomPrompt(Array.from(excludeSet));
        duel.usedPromptIds.push(prompt.id);
        for (const p of duel.players) {
            if (!p.isBot && p.profileKey) {
                const recent = this.playerRecentPrompts.get(p.profileKey) || [];
                recent.push(prompt.id);
                if (recent.length > 32) recent.shift();
                this.playerRecentPrompts.set(p.profileKey, recent);
            }
        }
        duel.currentPrompt = prompt;
        duel.state = 'FIGHT';
        duel.roundEndsAt = Date.now() + 16000;

        for (const p of duel.players) {
            p.answer = null;
            p.lastClash = null;
        }

        this._broadcast(duel, { type: 'ROUND_START', snapshot: this._snapshot(duel) });

        // If opponent is an AI bot, scale its answer rarity & reaction speed to the player's ELO tier
        const bot = duel.players.find(p => p.isBot);
        if (bot) {
            const minD = bot.aiMinDelay || 3200;
            const maxD = bot.aiMaxDelay || 6800;
            const delay = minD + Math.random() * (maxD - minD);
            setTimeout(() => {
                if (duel.state === 'FIGHT' && bot.answer === null) {
                    bot.answer = pickBotAnswer(prompt.id, bot.aiSkill || 'easy');
                    this._broadcast(duel, { type: 'FIGHTER_READY', playerId: bot.id, snapshot: this._snapshot(duel) });
                    this._checkBothReady(duel);
                }
            }, delay);
        }

        if (duel.timer) clearTimeout(duel.timer);
        duel.timer = setTimeout(() => this._resolveClash(duel), 16400);
    }

    _checkBothReady(duel) {
        if (duel.state !== 'FIGHT') return;
        if (duel.players.length === 2 && duel.players.every(p => p.answer !== null)) {
            if (duel.timer) clearTimeout(duel.timer);
            this._resolveClash(duel);
        }
    }

    _resolveClash(duel) {
        if (duel.state !== 'FIGHT' || duel.players.length < 2) return;
        duel.state = 'CLASH';

        const [p1, p2] = duel.players;
        const r1 = scoreAnswer(duel.currentPrompt.id, p1.answer || '');
        const r2 = scoreAnswer(duel.currentPrompt.id, p2.answer || '');

        let dmgToP2 = TIER_DAMAGE[r1.tier] || 0;
        let dmgToP1 = TIER_DAMAGE[r2.tier] || 0;
        let clashBlocked = false;

        // Identical valid answers clash & cancel out!
        if (r1.valid && r2.valid && r1.matched === r2.matched) {
            dmgToP1 = 0;
            dmgToP2 = 0;
            clashBlocked = true;
        } else {
            // Winner of the rarity clash deals a +6 Overpower Bonus!
            if (dmgToP2 > dmgToP1) dmgToP2 += 6;
            else if (dmgToP1 > dmgToP2) dmgToP1 += 6;
        }

        p2.hp = Math.max(0, p2.hp - dmgToP2);
        p1.hp = Math.max(0, p1.hp - dmgToP1);

        p1.lastClash = { raw: p1.answer || '(Missed)', tier: r1.tier, dealt: dmgToP2, took: dmgToP1, clashBlocked };
        p2.lastClash = { raw: p2.answer || '(Missed)', tier: r2.tier, dealt: dmgToP1, took: dmgToP2, clashBlocked };

        this._broadcast(duel, {
            type: 'CLASH_RESULT',
            clashBlocked,
            snapshot: this._snapshot(duel),
        });

        duel.timer = setTimeout(() => {
            if (p1.hp <= 0 || p2.hp <= 0) {
                duel.state = 'KO';
                const winner = p1.hp === p2.hp ? null : (p1.hp > p2.hp ? p1 : p2);
                const eloChanges = {};

                const p1PreElo = p1.elo ?? 0;
                const p2PreElo = p2.elo ?? 0;

                for (const [me, opp, oppElo] of [[p1, p2, p2PreElo], [p2, p1, p1PreElo]]) {
                    if (!me.isBot) {
                        const res = !winner ? 'DRAW' : (winner.id === me.id ? 'WIN' : 'LOSS');
                        const change = eloStore.recordMatch(me.profileKey, me.name, oppElo, res, Boolean(me.isAccount));
                        me.elo = change.newElo;
                        me.rank = change.rank;
                        eloChanges[me.id] = change;
                    }
                }

                this._broadcast(duel, {
                    type: 'MATCH_KO',
                    winner: winner ? { id: winner.id, name: winner.name, hp: winner.hp } : null,
                    eloChanges,
                    snapshot: this._snapshot(duel),
                });
            } else {
                this._nextRound(duel);
            }
        }, 3600);
    }

    _rematch(duel) {
        if (duel.timer) clearTimeout(duel.timer);
        duel.round = 0;
        duel.usedPromptIds = [];

        const human = duel.players.find(p => !p.isBot);
        for (const p of duel.players) {
            p.hp = MAX_HP;
            p.answer = null;
            p.lastClash = null;
            if (!p.isBot) {
                const fresh = eloStore.getProfile(p.profileKey, p.name, Boolean(p.isAccount));
                p.elo = fresh.elo;
                p.rank = fresh.rank;
            } else if (human) {
                // Re-scale AI difficulty to match human's updated ELO!
                const updatedAi = this._buildAiOpponent(human.elo ?? 0);
                p.elo = updatedAi.elo;
                p.rank = updatedAi.rank;
                p.aiTier = updatedAi.aiTier;
                p.aiSkill = updatedAi.aiSkill;
                p.aiMinDelay = updatedAi.aiMinDelay;
                p.aiMaxDelay = updatedAi.aiMaxDelay;
            }
        }
        this._nextRound(duel);
    }

    _snapshot(duel) {
        return {
            code: duel.code,
            state: duel.state,
            round: duel.round,
            currentPrompt: duel.currentPrompt,
            timeRemainingMs: Math.max(0, duel.roundEndsAt - Date.now()),
            players: duel.players.map(p => ({
                id: p.id,
                side: p.side,
                name: p.name,
                isBot: p.isBot,
                elo: p.elo ?? 0,
                rank: p.rank || eloStore.getRankForElo(p.elo ?? 0),
                aiTier: p.aiTier || null,
                hp: p.hp,
                maxHp: p.maxHp,
                ready: p.answer !== null,
                lastClash: (duel.state === 'CLASH' || duel.state === 'KO') ? p.lastClash : null,
            })),
        };
    }

    _send(ws, data) {
        if (ws && ws.readyState === 1) {
            try { ws.send(JSON.stringify(data)); } catch {}
        }
    }

    _broadcast(duel, data) {
        const str = JSON.stringify(data);
        for (const p of duel.players) {
            if (!p.isBot && p.ws && p.ws.readyState === 1) {
                try { p.ws.send(str); } catch {}
            }
        }
    }
}

module.exports = new DuelCombatEngine();
