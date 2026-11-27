/**
 * MindDrop Mode 2: Dynamite Pass (Hot Potato / Word Chain)
 * 2-8 players (or 1v1 vs ELO-scaled AI). One category, 15 seconds per turn.
 * Name a valid unused answer to pass the lit dynamite to the next player.
 * First player to run out of time explodes!
 */

const crypto = require('crypto');
const { PROMPTS, scoreAnswer, getSpellingSuggestions } = require('./prompts');
const eloStore = require('./eloStore');
const bloxCloud = require('./bloxCloudClient');
const wikiValidator = require('./wikiValidator');

const TURN_MS = 15000;
const MAX_PLAYERS = 8;
const BOT_NAMES = ['Dusty [AI]', 'Wyatt [AI]', 'Calamity [AI]', 'Ringo [AI]', 'Doc [AI]'];

class DynamitePassEngine {
    constructor() {
        this.rooms = new Map(); // code -> room
        this.playerDecks = new Map(); // profileKey -> shuffled prompt IDs
    }

    getHumanCount() {
        let count = 0;
        for (const r of this.rooms.values()) {
            for (const p of r.players) if (!p.isBot) count++;
        }
        return count;
    }

    _genCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
        return this.rooms.has(code) ? this._genCode() : code;
    }

    _drawPrompt(room) {
        const humans = room.players.filter(p => !p.isBot && p.profileKey);
        const key = humans.length ? humans[0].profileKey : '__pass_global__';
        let deck = this.playerDecks.get(key);
        if (!Array.isArray(deck) || deck.length === 0) {
            deck = PROMPTS.map(p => p.id);
            for (let i = deck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [deck[i], deck[j]] = [deck[j], deck[i]];
            }
        }
        const nextId = deck.pop();
        this.playerDecks.set(key, deck);
        const found = PROMPTS.find(p => p.id === nextId) || PROMPTS[0];
        return { id: found.id, category: found.category, prompt: found.prompt };
    }

    _buildAiPlayer(playerElo) {
        const aiConfig = eloStore.getAiTierForElo(playerElo);
        const aiElo = Math.max(0, playerElo + Math.floor((Math.random() - 0.5) * 40));
        // How many answers the AI can sustain before getting stumped under pressure
        const maxStreakMap = { easy: 6, medium: 12, hard: 19, grandmaster: 28 };
        return {
            id: 'bot_' + crypto.randomBytes(3).toString('hex'),
            name: BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)],
            isBot: true,
            elo: aiElo,
            rank: eloStore.getRankForElo(aiElo),
            aiTier: aiConfig.label,
            aiSkill: aiConfig.skill,
            aiMaxAnswers: (maxStreakMap[aiConfig.skill] || 6) + Math.floor(Math.random() * 4),
            alive: true,
            answeredCount: 0,
            checking: false,
            ws: null,
        };
    }

    joinOrCreateRoom({ code, mode, ws, name, profileId, isAccount = false, seenIds = [] }) {
        const cleanName = String(name || '').replace(/[^a-zA-Z0-9 _-]/g, '').trim().slice(0, 16) || 'Gunslinger';
        const profileKey = String(profileId || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || cleanName.toLowerCase().replace(/\s+/g, '_');
        const profile = eloStore.getProfile(profileKey, cleanName, Boolean(isAccount));

        if (Array.isArray(seenIds) && seenIds.length > 0 && !this.playerDecks.has(profileKey)) {
            const seenSet = new Set(seenIds);
            const unseen = PROMPTS.map(p => p.id).filter(id => !seenSet.has(id));
            for (let i = unseen.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [unseen[i], unseen[j]] = [unseen[j], unseen[i]];
            }
            if (unseen.length > 0) this.playerDecks.set(profileKey, unseen);
        }

        let roomCode = (code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);

        // Quick match: join an open public waiting room
        if (mode === 'quick' && !roomCode) {
            for (const [c, r] of this.rooms.entries()) {
                if (r.isPublic && r.state === 'WAITING' && r.players.length < 2) {
                    roomCode = c;
                    break;
                }
            }
        }
        if (!roomCode) roomCode = this._genCode();

        let room = this.rooms.get(roomCode);
        if (!room) {
            room = {
                code: roomCode,
                isPublic: mode === 'quick',
                hostId: null,
                state: 'WAITING', // WAITING | PLAYING | EXPLODED
                currentPrompt: null,
                usedAnswers: [],
                usedSet: new Set(),
                turnIndex: 0,
                turnEndsAt: 0,
                passCount: 0,
                players: [],
                timer: null,
                botTimer: null,
                lastEvent: null,
            };
            this.rooms.set(roomCode, room);
        }

        if (room.state !== 'WAITING') {
            this._send(ws, { type: 'ERROR', message: `Room ${roomCode} is already in progress.` });
            ws.close();
            return;
        }
        if (room.players.length >= MAX_PLAYERS) {
            this._send(ws, { type: 'ERROR', message: `Room ${roomCode} is full (${MAX_PLAYERS}/${MAX_PLAYERS}).` });
            ws.close();
            return;
        }

        const playerId = 'p_' + crypto.randomBytes(4).toString('hex');
        const player = {
            id: playerId,
            profileKey,
            isAccount: Boolean(isAccount),
            name: cleanName,
            isBot: false,
            elo: profile.elo,
            rank: profile.rank,
            aiTier: null,
            alive: true,
            answeredCount: 0,
            checking: false,
            ws,
        };
        room.players.push(player);
        if (!room.hostId) room.hostId = playerId;

        if (mode === 'ai' && room.players.length === 1) {
            room.players.push(this._buildAiPlayer(profile.elo));
        }

        this._send(ws, { type: 'PASS_JOINED', selfId: playerId, snapshot: this._snapshot(room) });
        this._broadcast(room, { type: 'PASS_UPDATE', snapshot: this._snapshot(room) });

        // Auto-start for Quick 1v1 or AI mode as soon as 2 players are ready
        if ((mode === 'ai' || room.isPublic) && room.players.length >= 2 && room.state === 'WAITING') {
            if (room.timer) clearTimeout(room.timer);
            room.timer = setTimeout(() => this._startMatch(room), 1000);
        }

        ws.on('message', async (raw) => {
            let msg;
            try { msg = JSON.parse(raw.toString()); } catch { return; }
            if (!msg || typeof msg.type !== 'string') return;

            if (msg.type === 'START_NOW' && room.state === 'WAITING' && room.players.length >= 2) {
                this._startMatch(room);
            } else if (msg.type === 'REMATCH' && room.state === 'EXPLODED' && room.players.length >= 2) {
                this._rematch(room);
            } else if (msg.type === 'SUGGEST' && room.state === 'PLAYING' && room.currentPrompt) {
                const active = room.players[room.turnIndex];
                if (!active || active.id !== playerId) return;
                const query = String(msg.query || '').trim().slice(0, 40);
                const items = getSpellingSuggestions(room.currentPrompt.id, query)
                    .filter(w => !room.usedSet.has(w));
                this._send(ws, { type: 'SUGGESTIONS', query, items });
            } else if (msg.type === 'SUBMIT_ANSWER' && room.state === 'PLAYING' && room.currentPrompt && !player.checking) {
                const active = room.players[room.turnIndex];
                if (!active || active.id !== playerId) return;
                const rawAnswer = String(msg.answer || '').trim().slice(0, 40);
                if (!rawAnswer) return;

                const promptAtSubmit = room.currentPrompt;
                let result = scoreAnswer(promptAtSubmit.id, rawAnswer);

                if (!result.valid) {
                    player.checking = true;
                    try {
                        const wikiRes = await wikiValidator.verifyAnswer(promptAtSubmit, rawAnswer);
                        if (wikiRes && wikiRes.valid) result = wikiRes;
                    } finally {
                        player.checking = false;
                    }
                    if (room.state !== 'PLAYING' || !room.players[room.turnIndex] || room.players[room.turnIndex].id !== playerId) {
                        return;
                    }
                }

                if (!result.valid) {
                    const suggestions = getSpellingSuggestions(promptAtSubmit.id, rawAnswer)
                        .filter(w => !room.usedSet.has(w));
                    this._send(ws, {
                        type: 'PASS_REJECTED',
                        raw: rawAnswer,
                        suggestions,
                        message: `"${rawAnswer}" is not recognized — keep guessing!`,
                    });
                    return;
                }

                if (room.usedSet.has(result.matched)) {
                    this._send(ws, {
                        type: 'PASS_REJECTED',
                        raw: rawAnswer,
                        suggestions: [],
                        message: `"${result.matched}" was already used — name another one!`,
                    });
                    return;
                }

                this._acceptPass(room, player, result.matched, Boolean(result.autoCorrected));
            }
        });

        ws.on('close', () => {
            const wasActive = room.state === 'PLAYING' && room.players[room.turnIndex] && room.players[room.turnIndex].id === playerId;
            room.players = room.players.filter(p => p.id !== playerId);
            const humansLeft = room.players.filter(p => !p.isBot).length;
            if (humansLeft === 0) {
                this._clearTimers(room);
                this.rooms.delete(room.code);
                return;
            }
            if (room.hostId === playerId) {
                const nextHost = room.players.find(p => !p.isBot);
                room.hostId = nextHost ? nextHost.id : null;
            }
            if (room.state === 'PLAYING') {
                const alive = room.players.filter(p => p.alive);
                if (alive.length <= 1) {
                    this._finishMatch(room, alive[0] || null, `${cleanName} fled the saloon!`);
                } else if (wasActive) {
                    room.turnIndex = room.turnIndex % room.players.length;
                    this._advanceTurn(room);
                } else {
                    this._broadcast(room, { type: 'PASS_UPDATE', snapshot: this._snapshot(room) });
                }
            } else {
                this._broadcast(room, { type: 'PASS_UPDATE', snapshot: this._snapshot(room) });
            }
        });
    }

    _clearTimers(room) {
        if (room.timer) { clearTimeout(room.timer); room.timer = null; }
        if (room.botTimer) { clearTimeout(room.botTimer); room.botTimer = null; }
    }

    _startMatch(room) {
        if (room.players.length < 2) return;
        this._clearTimers(room);
        room.state = 'PLAYING';
        room.currentPrompt = this._drawPrompt(room);
        room.usedAnswers = [];
        room.usedSet = new Set();
        room.passCount = 0;
        room.lastEvent = null;
        for (const p of room.players) {
            p.alive = true;
            p.answeredCount = 0;
            p.checking = false;
        }
        room.turnIndex = Math.floor(Math.random() * room.players.length);

        const hasBot = room.players.some(p => p.isBot);
        const qType = hasBot ? 'pass_ai' : (room.players.length > 2 ? 'pass_party' : 'pass_1v1');
        bloxCloud.recordMatchFormed(qType, room.players);

        this._beginTurn(room);
    }

    _beginTurn(room) {
        this._clearTimers(room);
        const active = room.players[room.turnIndex];
        if (!active || !active.alive) {
            this._advanceTurn(room);
            return;
        }
        room.turnEndsAt = Date.now() + TURN_MS;
        this._broadcast(room, { type: 'PASS_TURN', snapshot: this._snapshot(room) });

        // Schedule AI response if it's the AI's turn
        if (active.isBot) {
            const pObj = PROMPTS.find(x => x.id === room.currentPrompt.id);
            const pool = pObj ? [...pObj.common, ...pObj.uncommon, ...(active.aiSkill === 'hard' || active.aiSkill === 'grandmaster' ? pObj.rare : [])] : [];
            const available = Array.from(new Set(pool)).filter(w => !room.usedSet.has(w));
            const stumped = available.length === 0 || active.answeredCount >= (active.aiMaxAnswers || 6);

            if (!stumped) {
                const thinkMs = 2200 + Math.random() * 4800;
                room.botTimer = setTimeout(() => {
                    if (room.state === 'PLAYING' && room.players[room.turnIndex] && room.players[room.turnIndex].id === active.id) {
                        const pick = available[Math.floor(Math.random() * available.length)];
                        this._acceptPass(room, active, pick, false);
                    }
                }, thinkMs);
            }
            // If stumped, AI sweats until the 15s fuse blows up!
        }

        room.timer = setTimeout(() => this._explodeActivePlayer(room), TURN_MS + 150);
    }

    _acceptPass(room, player, matchedWord, autoCorrected) {
        this._clearTimers(room);
        room.usedSet.add(matchedWord);
        room.usedAnswers.unshift({ word: matchedWord, by: player.name, byId: player.id });
        if (room.usedAnswers.length > 40) room.usedAnswers.pop();
        player.answeredCount++;
        room.passCount++;
        room.lastEvent = {
            type: 'PASSED',
            by: player.name,
            word: matchedWord,
            autoCorrected,
        };

        this._advanceTurn(room);
    }

    _advanceTurn(room) {
        const total = room.players.length;
        for (let step = 1; step <= total; step++) {
            const idx = (room.turnIndex + step) % total;
            if (room.players[idx] && room.players[idx].alive) {
                room.turnIndex = idx;
                this._beginTurn(room);
                return;
            }
        }
    }

    _explodeActivePlayer(room) {
        if (room.state !== 'PLAYING') return;
        this._clearTimers(room);
        const loser = room.players[room.turnIndex];
        if (!loser) return;
        loser.alive = false;

        room.lastEvent = {
            type: 'BOOM',
            victimId: loser.id,
            victimName: loser.name,
        };

        // Match ends immediately once the dynamite explodes — first person to blow up loses!
        const survivors = room.players.filter(p => p.alive);
        const primaryWinner = survivors.length === 1 ? survivors[0] : (survivors[0] || null);
        this._finishMatch(room, primaryWinner, `${loser.name} ran out of time and blew up!`, loser);
    }

    _finishMatch(room, winner, reason, loser = null) {
        this._clearTimers(room);
        room.state = 'EXPLODED';
        const eloChanges = {};
        const winnerIds = new Set(
            loser
                ? room.players.filter(p => p.alive && p.id !== loser.id).map(p => p.id)
                : (winner ? [winner.id] : [])
        );

        const avgElo = Math.round(room.players.reduce((s, p) => s + (p.elo ?? 0), 0) / Math.max(1, room.players.length));
        for (const p of room.players) {
            if (!p.isBot) {
                const res = winnerIds.has(p.id) ? 'WIN' : 'LOSS';
                const oppElo = room.players.length === 2
                    ? ((room.players.find(o => o.id !== p.id) || {}).elo ?? avgElo)
                    : avgElo;
                const change = eloStore.recordMatch(p.profileKey, p.name, oppElo, res, Boolean(p.isAccount));
                p.elo = change.newElo;
                p.rank = change.rank;
                eloChanges[p.id] = change;
            }
        }

        this._broadcast(room, {
            type: 'PASS_GAME_OVER',
            winner: winner ? { id: winner.id, name: winner.name, answeredCount: winner.answeredCount } : null,
            winnerIds: Array.from(winnerIds),
            loser: loser ? { id: loser.id, name: loser.name } : null,
            reason,
            eloChanges,
            snapshot: this._snapshot(room),
        });
    }

    _rematch(room) {
        const human = room.players.find(p => !p.isBot);
        for (const p of room.players) {
            if (!p.isBot) {
                const fresh = eloStore.getProfile(p.profileKey, p.name, Boolean(p.isAccount));
                p.elo = fresh.elo;
                p.rank = fresh.rank;
            } else if (human) {
                const updated = this._buildAiPlayer(human.elo ?? 0);
                p.elo = updated.elo;
                p.rank = updated.rank;
                p.aiTier = updated.aiTier;
                p.aiSkill = updated.aiSkill;
                p.aiMaxAnswers = updated.aiMaxAnswers;
            }
        }
        this._startMatch(room);
    }

    _snapshot(room) {
        const active = room.players[room.turnIndex] || null;
        return {
            code: room.code,
            state: room.state,
            hostId: room.hostId,
            currentPrompt: room.currentPrompt,
            activePlayerId: active ? active.id : null,
            activePlayerName: active ? active.name : null,
            timeRemainingMs: Math.max(0, room.turnEndsAt - Date.now()),
            passCount: room.passCount,
            usedAnswers: room.usedAnswers.slice(0, 24),
            lastEvent: room.lastEvent,
            players: room.players.map(p => ({
                id: p.id,
                name: p.name,
                isBot: p.isBot,
                elo: p.elo ?? 0,
                rank: p.rank || eloStore.getRankForElo(p.elo ?? 0),
                aiTier: p.aiTier || null,
                alive: p.alive,
                answeredCount: p.answeredCount,
            })),
        };
    }

    _send(ws, data) {
        if (ws && ws.readyState === 1) {
            try { ws.send(JSON.stringify(data)); } catch {}
        }
    }

    _broadcast(room, data) {
        const str = JSON.stringify(data);
        for (const p of room.players) {
            if (!p.isBot && p.ws && p.ws.readyState === 1) {
                try { p.ws.send(str); } catch {}
            }
        }
    }
}

module.exports = new DynamitePassEngine();
