/**
 * MindDrop — Mode 3: Quick-Draw Trivia (First-to-Buzz, First to 7 Wins)
 * Supports 2-8 players (online quick match, private friend rooms) OR instant 1v1 vs Adaptive AI.
 */

const crypto = require('crypto');
const { TRIVIA_QUESTIONS } = require('./triviaBank');
const bloxCloud = require('./bloxCloudClient');
const eloStore = require('./eloStore');

const WIN_SCORE = 7;
const READY_MS = 1500;
const ROUND_MS = 12000;
const REVEAL_MS = 2300;
const MAX_PLAYERS = 8;

function makeCode() {
    return crypto.randomBytes(2).toString('hex').toUpperCase();
}

function shuffle(arr) {
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = out[i]; out[i] = out[j]; out[j] = t;
    }
    return out;
}

class QuickDrawEngine {
    constructor() {
        this.rooms = new Map();
    }

    getStats() {
        let activePlayers = 0;
        for (const r of this.rooms.values()) {
            activePlayers += r.players.filter(p => !p.isBot).length;
        }
        return { rooms: this.rooms.size, players: activePlayers };
    }

    _buildAiPlayer(humanElo) {
        const tier = eloStore.getAiTierForElo(humanElo);
        const speedBySkill = {
            easy: { minMs: 3600, maxMs: 6500, acc: 0.72 },
            medium: { minMs: 2500, maxMs: 4800, acc: 0.80 },
            hard: { minMs: 1800, maxMs: 3400, acc: 0.88 },
            grandmaster: { minMs: 1200, maxMs: 2400, acc: 0.94 },
        };
        const cfg = speedBySkill[tier.skill] || speedBySkill.easy;
        return {
            id: 'bot_' + crypto.randomBytes(3).toString('hex'),
            profileKey: 'bot',
            name: tier.botName,
            ws: null,
            isBot: true,
            isAccount: false,
            elo: tier.botElo,
            rank: eloStore.getRank(tier.botElo),
            aiTier: tier.label,
            aiSkill: tier.skill,
            aiCfg: cfg,
            score: 0,
            jammed: false,
            lastReactionMs: null,
        };
    }

    _buildDeck(seenIds) {
        const seen = new Set(Array.isArray(seenIds) ? seenIds : []);
        const fresh = shuffle(TRIVIA_QUESTIONS.filter(q => !seen.has(q.id)));
        const older = shuffle(TRIVIA_QUESTIONS.filter(q => seen.has(q.id)));
        return [...fresh, ...older];
    }

    _drawQuestion(room) {
        if (!room.deck || room.deck.length === 0) {
            room.deck = shuffle(TRIVIA_QUESTIONS);
        }
        return room.deck.shift();
    }

    _createRoom(code, isPrivate, seenIds) {
        const room = {
            code,
            isPrivate,
            state: 'WAITING', // WAITING | READY | DRAW | REVEAL | FINISHED
            hostId: null,
            players: [],
            deck: this._buildDeck(seenIds),
            round: 0,
            currentQuestion: null,
            drawStartedAt: 0,
            roundEndsAt: 0,
            lastWinner: null,
            lastCorrectIndex: null,
            lastRevealReason: '',
            timer: null,
            botTimer: null,
        };
        this.rooms.set(code, room);
        return room;
    }

    joinQuickDraw(ws, { mode = 'quick', roomCode = '', name = 'Gunslinger', profileId = '', authUser = null, seenIds = [] }) {
        const playerId = 'p_' + crypto.randomBytes(4).toString('hex');
        const cleanName = authUser
            ? authUser.username
            : (String(name || 'Gunslinger').trim().slice(0, 16) || 'Gunslinger');
        const isAccount = Boolean(authUser);
        const profileKey = isAccount
            ? `u_${authUser.id}`
            : (String(profileId || '').trim().slice(0, 40) || `anon_${playerId}`);
        const profile = eloStore.getProfile(profileKey, cleanName, isAccount);

        const player = {
            id: playerId,
            profileKey,
            name: cleanName,
            ws,
            isBot: false,
            isAccount,
            elo: profile.elo,
            rank: profile.rank,
            score: 0,
            jammed: false,
            lastReactionMs: null,
        };

        let room = null;
        const cleanCode = String(roomCode || '').trim().toUpperCase().slice(0, 12);

        if (mode === 'ai') {
            room = this._createRoom(makeCode(), true, seenIds);
            room.hostId = playerId;
            room.players.push(player);
            room.players.push(this._buildAiPlayer(profile.elo));
        } else if (mode === 'private' && cleanCode) {
            room = this.rooms.get(cleanCode);
            if (!room) {
                room = this._createRoom(cleanCode, true, seenIds);
                room.hostId = playerId;
            }
            if (room.state !== 'WAITING' && room.state !== 'FINISHED') {
                this._send(ws, { type: 'QD_ERROR', message: `Room ${cleanCode} is already mid-match.` });
                ws.close();
                return;
            }
            if (room.players.length >= MAX_PLAYERS) {
                this._send(ws, { type: 'QD_ERROR', message: `Room ${cleanCode} is full (${MAX_PLAYERS} max).` });
                ws.close();
                return;
            }
            room.players.push(player);
        } else {
            // Quick Online: join an open public waiting room
            for (const r of this.rooms.values()) {
                if (!r.isPrivate && r.state === 'WAITING' && r.players.length < 2) {
                    room = r;
                    break;
                }
            }
            if (!room) {
                room = this._createRoom(makeCode(), false, seenIds);
                room.hostId = playerId;
            }
            room.players.push(player);
        }

        this._send(ws, { type: 'QD_JOINED', selfId: playerId, snapshot: this._snapshot(room) });
        this._broadcast(room, { type: 'QD_UPDATE', snapshot: this._snapshot(room) });

        if (mode === 'ai' || (!room.isPrivate && room.players.length >= 2)) {
            this._startMatch(room);
        }

        ws.on('message', (raw) => {
            let msg;
            try { msg = JSON.parse(raw.toString()); } catch { return; }
            if (!msg || typeof msg.type !== 'string') return;

            if (msg.type === 'START_NOW' && room.state === 'WAITING' && room.players.length >= 2) {
                this._startMatch(room);
            } else if (msg.type === 'REMATCH' && room.state === 'FINISHED' && room.players.length >= 2) {
                this._rematch(room);
            } else if (msg.type === 'BUZZ_ANSWER' && room.state === 'DRAW' && room.currentQuestion) {
                const choiceIdx = Number(msg.choiceIndex);
                if (!Number.isInteger(choiceIdx) || choiceIdx < 0 || choiceIdx > 3) return;
                this._handleAnswer(room, player, choiceIdx);
            }
        });

        ws.on('close', () => {
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
            if (room.state !== 'WAITING' && room.state !== 'FINISHED' && room.players.length < 2) {
                this._finishMatch(room, room.players[0] || null, `${cleanName} left the shootout!`);
            } else {
                this._broadcast(room, { type: 'QD_UPDATE', snapshot: this._snapshot(room) });
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
        room.round = 0;
        room.lastWinner = null;
        room.lastCorrectIndex = null;
        room.lastRevealReason = '';
        for (const p of room.players) {
            p.score = 0;
            p.jammed = false;
            p.lastReactionMs = null;
        }
        const hasBot = room.players.some(p => p.isBot);
        const qType = hasBot ? 'quickdraw_ai' : (room.players.length > 2 ? 'quickdraw_party' : 'quickdraw_1v1');
        bloxCloud.recordMatchFormed(qType, room.players);

        this._beginReadyPhase(room);
    }

    _beginReadyPhase(room) {
        this._clearTimers(room);
        room.round += 1;
        room.state = 'READY';
        room.currentQuestion = null;
        room.lastWinner = null;
        room.lastCorrectIndex = null;
        room.lastRevealReason = '';
        for (const p of room.players) {
            p.jammed = false;
            p.lastReactionMs = null;
        }
        this._broadcast(room, { type: 'QD_READY', snapshot: this._snapshot(room) });
        room.timer = setTimeout(() => this._beginDrawPhase(room), READY_MS);
    }

    _beginDrawPhase(room) {
        if (room.state !== 'READY') return;
        this._clearTimers(room);
        room.state = 'DRAW';
        room.currentQuestion = this._drawQuestion(room);
        room.drawStartedAt = Date.now();
        room.roundEndsAt = room.drawStartedAt + ROUND_MS;
        this._broadcast(room, { type: 'QD_DRAW', snapshot: this._snapshot(room) });

        // Schedule AI quick-draw if a bot is in the room
        const bot = room.players.find(p => p.isBot);
        if (bot && bot.aiCfg) {
            const delay = bot.aiCfg.minMs + Math.random() * (bot.aiCfg.maxMs - bot.aiCfg.minMs);
            room.botTimer = setTimeout(() => {
                if (room.state !== 'DRAW' || !room.currentQuestion || bot.jammed) return;
                const correctIdx = room.currentQuestion.answerIndex;
                let pick = correctIdx;
                if (Math.random() > bot.aiCfg.acc) {
                    const wrong = [0, 1, 2, 3].filter(i => i !== correctIdx);
                    pick = wrong[Math.floor(Math.random() * wrong.length)];
                }
                this._handleAnswer(room, bot, pick);
            }, delay);
        }

        room.timer = setTimeout(() => this._timeoutRound(room), ROUND_MS + 100);
    }

    _handleAnswer(room, player, choiceIndex) {
        if (room.state !== 'DRAW' || !room.currentQuestion || player.jammed) return;
        const correctIdx = room.currentQuestion.answerIndex;
        const reactionMs = Math.max(120, Date.now() - room.drawStartedAt);

        if (choiceIndex === correctIdx) {
            // FASTEST CORRECT SHOT!
            this._clearTimers(room);
            player.score += 1;
            player.lastReactionMs = reactionMs;
            room.state = 'REVEAL';
            room.lastWinner = { id: player.id, name: player.name, reactionMs };
            room.lastCorrectIndex = correctIdx;
            room.lastRevealReason = `${player.name} drew first in ${(reactionMs / 1000).toFixed(2)}s!`;

            this._broadcast(room, {
                type: 'QD_SHOT',
                shooter: { id: player.id, name: player.name, reactionMs },
                correctIndex: correctIdx,
                snapshot: this._snapshot(room),
            });

            if (player.score >= WIN_SCORE) {
                room.timer = setTimeout(() => {
                    this._finishMatch(room, player, `${player.name} hit ${WIN_SCORE} bullseyes first!`);
                }, 1600);
            } else {
                room.timer = setTimeout(() => this._beginReadyPhase(room), REVEAL_MS);
            }
        } else {
            // WRONG SHOT -> Revolver jams for this round!
            player.jammed = true;
            this._broadcast(room, {
                type: 'QD_JAMMED',
                playerId: player.id,
                playerName: player.name,
                choiceIndex,
                snapshot: this._snapshot(room),
            });

            // If every player is jammed, reveal immediately
            const anyUnjammed = room.players.some(p => !p.jammed);
            if (!anyUnjammed) {
                this._timeoutRound(room, 'Every gunslinger jammed their revolver!');
            }
        }
    }

    _timeoutRound(room, customReason) {
        if (room.state !== 'DRAW' || !room.currentQuestion) return;
        this._clearTimers(room);
        room.state = 'REVEAL';
        room.lastWinner = null;
        room.lastCorrectIndex = room.currentQuestion.answerIndex;
        room.lastRevealReason = customReason || 'Time up! No one hit the target.';

        this._broadcast(room, {
            type: 'QD_REVEAL',
            correctIndex: room.lastCorrectIndex,
            reason: room.lastRevealReason,
            snapshot: this._snapshot(room),
        });

        room.timer = setTimeout(() => this._beginReadyPhase(room), REVEAL_MS);
    }

    _finishMatch(room, winner, reason) {
        this._clearTimers(room);
        room.state = 'FINISHED';
        const eloChanges = {};
        const avgElo = Math.round(room.players.reduce((s, p) => s + (p.elo ?? 0), 0) / Math.max(1, room.players.length));

        for (const p of room.players) {
            if (!p.isBot) {
                const res = winner && winner.id === p.id ? 'WIN' : 'LOSS';
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
            type: 'QD_GAME_OVER',
            winner: winner ? { id: winner.id, name: winner.name, score: winner.score } : null,
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
                p.aiCfg = updated.aiCfg;
            }
        }
        this._startMatch(room);
    }

    _snapshot(room) {
        return {
            code: room.code,
            state: room.state,
            hostId: room.hostId,
            winScore: WIN_SCORE,
            round: room.round,
            roundMs: ROUND_MS,
            timeRemainingMs: room.state === 'DRAW' ? Math.max(0, room.roundEndsAt - Date.now()) : 0,
            question: room.currentQuestion ? {
                id: room.currentQuestion.id,
                category: room.currentQuestion.category,
                question: room.currentQuestion.question,
                choices: room.currentQuestion.choices,
            } : null,
            lastWinner: room.lastWinner,
            lastCorrectIndex: room.state === 'REVEAL' || room.state === 'FINISHED' ? room.lastCorrectIndex : null,
            lastRevealReason: room.lastRevealReason,
            players: room.players.map(p => ({
                id: p.id,
                name: p.name,
                isBot: p.isBot,
                aiTier: p.aiTier || null,
                elo: p.elo ?? 0,
                rank: p.rank,
                score: p.score,
                jammed: p.jammed,
                lastReactionMs: p.lastReactionMs,
            })),
        };
    }

    _send(ws, obj) {
        if (ws && ws.readyState === 1) ws.send(JSON.stringify(obj));
    }

    _broadcast(room, obj) {
        const payload = JSON.stringify(obj);
        for (const p of room.players) {
            if (p.ws && p.ws.readyState === 1) p.ws.send(payload);
        }
    }
}

module.exports = new QuickDrawEngine();
