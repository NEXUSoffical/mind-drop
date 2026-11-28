/**
 * MindDrop — Mode 5: Frontier Clash (Mini Clash Royale — Real-Time 2-Lane Wild West Strategy)
 * Server-authoritative 20Hz simulation, 8 Wild West cards, 2 bridges, 3 towers per side,
 * Double Elixir final 60s, live 1v1 matchmaking, private friend rooms, and Adaptive AI.
 */

const crypto = require('crypto');
const bloxCloud = require('./bloxCloudClient');
const eloStore = require('./eloStore');

const ARENA_W = 100;
const ARENA_H = 160;
const RIVER_Y = 80;
const BRIDGE_XS = [24, 76];
const MATCH_MS = 150000; // 2:30
const DOUBLE_ELIXIR_MS = 60000;
const MAX_ELIXIR = 10;
const BASE_ELIXIR_PER_SEC = 0.42; // ~1 elixir every 2.38s (0.84/s in Double Elixir)

const CLASH_CARDS = [
    { id: 'bandits', name: 'Outlaw Gang', cost: 3, type: 'troop', count: 3, hp: 135, dmg: 38, range: 6, speed: 15, atkMs: 850, splash: 0, targetBuildings: false, color: '#f97316', role: '3x Swarm' },
    { id: 'gunslinger', name: 'Gunslinger', cost: 3, type: 'troop', count: 1, hp: 240, dmg: 54, range: 26, speed: 11, atkMs: 950, splash: 0, targetBuildings: false, color: '#38bdf8', role: 'Ranged' },
    { id: 'brawler', name: 'Iron Brawler', cost: 5, type: 'troop', count: 1, hp: 860, dmg: 88, range: 7, speed: 7.5, atkMs: 1250, splash: 0, targetBuildings: true, color: '#fbbf24', role: 'Tank' },
    { id: 'bomber', name: 'TNT Bomber', cost: 4, type: 'troop', count: 1, hp: 230, dmg: 82, range: 22, speed: 10.5, atkMs: 1300, splash: 13, targetBuildings: false, color: '#ef4444', role: 'Splash' },
    { id: 'mustang', name: 'Mustang Rider', cost: 4, type: 'troop', count: 1, hp: 480, dmg: 94, range: 7, speed: 18, atkMs: 1100, splash: 0, targetBuildings: true, color: '#d97706', role: 'Fast Siege' },
    { id: 'sniper', name: 'Sharpshooter', cost: 4, type: 'troop', count: 1, hp: 205, dmg: 96, range: 36, speed: 9.5, atkMs: 1450, splash: 0, targetBuildings: false, color: '#c084fc', role: 'Long Range' },
    { id: 'cannon', name: 'Cannon Cart', cost: 5, type: 'troop', count: 1, hp: 470, dmg: 108, range: 28, speed: 8.5, atkMs: 1400, splash: 10, targetBuildings: false, color: '#94a3b8', role: 'Heavy Siege' },
    { id: 'barrage', name: 'TNT Barrage', cost: 4, type: 'spell', radius: 18, dmg: 230, towerDmg: 125, color: '#fde047', role: 'AoE Spell' },
];

const CARD_MAP = new Map(CLASH_CARDS.map(c => [c.id, c]));

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

function makeTowers() {
    return [
        // Side 0 (Bottom)
        { id: 't0_l', side: 0, kind: 'outpost', x: 24, y: 128, hp: 900, maxHp: 900, range: 30, dmg: 48, atkMs: 900, cd: 0 },
        { id: 't0_r', side: 0, kind: 'outpost', x: 76, y: 128, hp: 900, maxHp: 900, range: 30, dmg: 48, atkMs: 900, cd: 0 },
        { id: 't0_k', side: 0, kind: 'king', x: 50, y: 146, hp: 1800, maxHp: 1800, range: 32, dmg: 64, atkMs: 1000, cd: 0 },
        // Side 1 (Top)
        { id: 't1_l', side: 1, kind: 'outpost', x: 24, y: 32, hp: 900, maxHp: 900, range: 30, dmg: 48, atkMs: 900, cd: 0 },
        { id: 't1_r', side: 1, kind: 'outpost', x: 76, y: 32, hp: 900, maxHp: 900, range: 30, dmg: 48, atkMs: 900, cd: 0 },
        { id: 't1_k', side: 1, kind: 'king', x: 50, y: 14, hp: 1800, maxHp: 1800, range: 32, dmg: 64, atkMs: 1000, cd: 0 },
    ];
}

class ClashEngine {
    constructor() {
        this.rooms = new Map();
    }

    getStats() {
        let players = 0;
        for (const r of this.rooms.values()) {
            players += r.players.filter(p => !p.isBot).length;
        }
        return { rooms: this.rooms.size, players };
    }

    _initDeckForPlayer(p) {
        const deck = shuffle(CLASH_CARDS.map(c => c.id));
        p.hand = deck.slice(0, 4);
        p.queue = deck.slice(4);
        p.elixir = 5.0;
        p.crowns = 0;
    }

    _buildAiPlayer(humanElo) {
        const tier = eloStore.getAiTierForElo(humanElo);
        const thinkBySkill = {
            easy: { minMs: 3600, maxMs: 5600 },
            medium: { minMs: 2600, maxMs: 4200 },
            hard: { minMs: 1900, maxMs: 3200 },
            grandmaster: { minMs: 1300, maxMs: 2300 },
        };
        const ai = {
            id: 'bot_' + crypto.randomBytes(3).toString('hex'),
            profileKey: 'bot',
            name: tier.botName,
            ws: null,
            isBot: true,
            isAccount: false,
            side: 1,
            elo: tier.botElo,
            rank: eloStore.getRankForElo(tier.botElo),
            aiTier: tier.label,
            aiSkill: tier.skill,
            aiThink: thinkBySkill[tier.skill] || thinkBySkill.easy,
            nextThinkAt: 0,
            hand: [],
            queue: [],
            elixir: 5.0,
            crowns: 0,
        };
        this._initDeckForPlayer(ai);
        return ai;
    }

    _createRoom(code, isPrivate) {
        const room = {
            code,
            isPrivate,
            state: 'WAITING', // WAITING | PLAYING | FINISHED
            players: [],
            towers: makeTowers(),
            units: [],
            effects: [],
            nextUnitId: 1,
            startedAt: 0,
            endsAt: 0,
            lastTickAt: 0,
            lastBroadcastAt: 0,
            loop: null,
        };
        this.rooms.set(code, room);
        return room;
    }

    joinClash(ws, { mode = 'quick', roomCode = '', name = 'Gunslinger', profileId = '', authUser = null }) {
        const playerId = 'p_' + crypto.randomBytes(4).toString('hex');
        const cleanName = authUser
            ? authUser.username
            : (String(name || 'Gunslinger').trim().slice(0, 16) || 'Gunslinger');
        const isAccount = Boolean(authUser);
        const profileKey = isAccount
            ? authUser.id
            : (String(profileId || '').trim().slice(0, 40) || `anon_${playerId}`);
        const profile = eloStore.getProfile(profileKey, cleanName, isAccount);

        const player = {
            id: playerId,
            profileKey,
            name: cleanName,
            ws,
            isBot: false,
            isAccount,
            side: 0,
            elo: profile.elo,
            rank: profile.rank,
            hand: [],
            queue: [],
            elixir: 5.0,
            crowns: 0,
        };
        this._initDeckForPlayer(player);

        let room = null;
        const cleanCode = String(roomCode || '').trim().toUpperCase().slice(0, 12);

        if (mode === 'ai') {
            room = this._createRoom(makeCode(), true);
            player.side = 0;
            room.players.push(player);
            room.players.push(this._buildAiPlayer(profile.elo));
        } else if (mode === 'private' && cleanCode) {
            room = this.rooms.get(cleanCode);
            if (!room) {
                room = this._createRoom(cleanCode, true);
            }
            if (room.players.length >= 2) {
                this._send(ws, { type: 'CLASH_ERROR', message: `Room ${cleanCode} is already full (1v1).` });
                ws.close();
                return;
            }
            player.side = room.players.length === 0 ? 0 : 1;
            room.players.push(player);
        } else {
            for (const r of this.rooms.values()) {
                if (!r.isPrivate && r.state === 'WAITING' && r.players.length === 1) {
                    room = r;
                    break;
                }
            }
            if (!room) {
                room = this._createRoom(makeCode(), false);
            }
            player.side = room.players.length === 0 ? 0 : 1;
            room.players.push(player);
        }

        this._send(ws, {
            type: 'CLASH_JOINED',
            selfId: playerId,
            side: player.side,
            cards: CLASH_CARDS,
            snapshot: this._snapshotFor(room, player),
        });

        if (room.players.length === 2) {
            this._startMatch(room);
        }

        ws.on('message', (raw) => {
            let msg;
            try { msg = JSON.parse(raw.toString()); } catch { return; }
            if (!msg || typeof msg.type !== 'string') return;

            if (msg.type === 'DEPLOY_CARD' && room.state === 'PLAYING') {
                this._deployCard(room, player, String(msg.cardId || ''), Number(msg.x), Number(msg.y));
            } else if (msg.type === 'REMATCH' && room.state === 'FINISHED' && room.players.length === 2) {
                this._rematch(room);
            }
        });

        ws.on('close', () => {
            room.players = room.players.filter(p => p.id !== playerId);
            const humansLeft = room.players.filter(p => !p.isBot).length;
            if (humansLeft === 0) {
                this._stopLoop(room);
                this.rooms.delete(room.code);
                return;
            }
            if (room.state === 'PLAYING') {
                const winner = room.players[0] || null;
                this._finishMatch(room, winner, `${cleanName} surrendered the frontier!`);
            }
        });
    }

    _stopLoop(room) {
        if (room.loop) { clearInterval(room.loop); room.loop = null; }
    }

    _startMatch(room) {
        this._stopLoop(room);
        room.state = 'PLAYING';
        room.towers = makeTowers();
        room.units = [];
        room.effects = [];
        room.nextUnitId = 1;
        room.startedAt = Date.now();
        room.endsAt = room.startedAt + MATCH_MS;
        room.lastTickAt = room.startedAt;
        room.lastBroadcastAt = 0;

        room.players.forEach((p, idx) => {
            p.side = idx;
            this._initDeckForPlayer(p);
            if (p.isBot) p.nextThinkAt = room.startedAt + 2400;
        });

        const hasBot = room.players.some(p => p.isBot);
        bloxCloud.recordMatchFormed(hasBot ? 'clash_ai' : 'clash_1v1', room.players);

        this._broadcastState(room, 'CLASH_START');
        room.loop = setInterval(() => this._tick(room), 50);
    }

    _deployCard(room, player, cardId, rawX, rawY) {
        const card = CARD_MAP.get(cardId);
        if (!card) return;
        const handIdx = player.hand.indexOf(cardId);
        if (handIdx === -1) return;
        if (player.elixir + 0.01 < card.cost) return;

        let x = Math.max(6, Math.min(ARENA_W - 6, Number.isFinite(rawX) ? rawX : 50));
        let y = Math.max(8, Math.min(ARENA_H - 8, Number.isFinite(rawY) ? rawY : (player.side === 0 ? 115 : 45)));

        // Troops must deploy on your own side of the river (Spells can hit anywhere!)
        if (card.type === 'troop') {
            if (player.side === 0) y = Math.max(RIVER_Y + 6, Math.min(ARENA_H - 12, y));
            else y = Math.max(12, Math.min(RIVER_Y - 6, y));
        }

        // Spend elixir & cycle card
        player.elixir = Math.max(0, player.elixir - card.cost);
        const nextCard = player.queue.shift();
        player.hand[handIdx] = nextCard;
        player.queue.push(cardId);

        if (card.type === 'spell') {
            room.effects.push({ kind: 'boom', x, y, r: card.radius, color: card.color, ttl: 550 });
            for (const u of room.units) {
                if (u.side !== player.side && u.hp > 0 && Math.hypot(u.x - x, u.y - y) <= card.radius) {
                    u.hp -= card.dmg;
                }
            }
            for (const t of room.towers) {
                if (t.side !== player.side && t.hp > 0 && Math.hypot(t.x - x, t.y - y) <= card.radius + 6) {
                    t.hp -= card.towerDmg;
                }
            }
            return;
        }

        // Spawn troop(s)
        const count = card.count || 1;
        for (let i = 0; i < count; i++) {
            const ox = count > 1 ? (i - 1) * 5.5 : 0;
            const oy = count > 1 ? (i === 1 ? -3.5 : 2.5) : 0;
            room.units.push({
                id: room.nextUnitId++,
                cardId: card.id,
                side: player.side,
                x: Math.max(6, Math.min(ARENA_W - 6, x + ox)),
                y: Math.max(8, Math.min(ARENA_H - 8, y + oy)),
                hp: card.hp,
                maxHp: card.hp,
                dmg: card.dmg,
                range: card.range,
                speed: card.speed,
                atkMs: card.atkMs,
                splash: card.splash || 0,
                targetBuildings: Boolean(card.targetBuildings),
                color: card.color,
                cd: 250,
            });
        }
        room.effects.push({ kind: 'spawn', x, y, r: 9, color: card.color, ttl: 320 });
    }

    _aiStep(room, bot, now) {
        if (now < bot.nextThinkAt) return;
        const affordable = bot.hand.map(id => CARD_MAP.get(id)).filter(c => c && bot.elixir >= c.cost);
        if (affordable.length === 0) return;

        // Check if player is pushing a lane on bot's side
        const threats = room.units.filter(u => u.side === 0 && u.hp > 0 && u.y < 105);
        let pick = affordable[Math.floor(Math.random() * affordable.length)];
        let dx = Math.random() < 0.5 ? 24 : 76;
        let dy = 56;

        if (threats.length > 0) {
            const topThreat = threats.sort((a, b) => a.y - b.y)[0];
            dx = topThreat.x < 50 ? 24 : 76;
            dy = Math.max(24, Math.min(RIVER_Y - 8, topThreat.y - 12));
            const spell = affordable.find(c => c.type === 'spell');
            if (spell && threats.length >= 2) {
                pick = spell;
                dx = topThreat.x;
                dy = topThreat.y;
            } else {
                const defender = affordable.find(c => c.type === 'troop' && !c.targetBuildings);
                if (defender) pick = defender;
            }
        } else if (bot.elixir >= 7.2) {
            const tank = affordable.find(c => c.targetBuildings) || affordable[0];
            pick = tank;
            dx = Math.random() < 0.5 ? 24 : 76;
            dy = 64;
        } else if (bot.elixir < 6) {
            return; // wait for a stronger push
        }

        this._deployCard(room, bot, pick.id, dx + (Math.random() - 0.5) * 6, dy);
        bot.nextThinkAt = now + bot.aiThink.minMs + Math.random() * (bot.aiThink.maxMs - bot.aiThink.minMs);
    }

    _tick(room) {
        if (room.state !== 'PLAYING') return;
        const now = Date.now();
        const dt = Math.min(0.1, (now - room.lastTickAt) / 1000);
        const dtMs = dt * 1000;
        room.lastTickAt = now;

        const remainingMs = Math.max(0, room.endsAt - now);
        const doubleElixir = remainingMs <= DOUBLE_ELIXIR_MS;
        const elixirRate = BASE_ELIXIR_PER_SEC * (doubleElixir ? 2 : 1);

        // 1. Regenerate elixir & step AI
        for (const p of room.players) {
            p.elixir = Math.min(MAX_ELIXIR, p.elixir + elixirRate * dt);
            if (p.isBot) this._aiStep(room, p, now);
        }

        // 2. Age visual effects
        for (let i = room.effects.length - 1; i >= 0; i--) {
            room.effects[i].ttl -= dtMs;
            if (room.effects[i].ttl <= 0) room.effects.splice(i, 1);
        }

        // 3. Towers fire at nearest enemy unit in range
        for (const t of room.towers) {
            if (t.hp <= 0) continue;
            t.cd = Math.max(0, t.cd - dtMs);
            if (t.cd > 0) continue;
            let best = null, bestD = t.range;
            for (const u of room.units) {
                if (u.side === t.side || u.hp <= 0) continue;
                const d = Math.hypot(u.x - t.x, u.y - t.y);
                if (d < bestD) { bestD = d; best = u; }
            }
            if (best) {
                best.hp -= t.dmg;
                t.cd = t.atkMs;
                room.effects.push({ kind: 'shot', x1: t.x, y1: t.y, x2: best.x, y2: best.y, color: t.side === 0 ? '#38bdf8' : '#fb7185', ttl: 180 });
            }
        }

        // 4. Units acquire target, move across bridges, and attack
        for (const u of room.units) {
            if (u.hp <= 0) continue;
            u.cd = Math.max(0, u.cd - dtMs);

            let target = null;
            let bestD = Infinity;

            // Check enemy units within aggro range (unless building-only tank)
            if (!u.targetBuildings) {
                const aggro = Math.max(26, u.range + 8);
                for (const e of room.units) {
                    if (e.side === u.side || e.hp <= 0) continue;
                    const d = Math.hypot(e.x - u.x, e.y - u.y);
                    if (d < aggro && d < bestD) { bestD = d; target = e; }
                }
            }

            // Otherwise target nearest standing enemy tower
            if (!target) {
                for (const t of room.towers) {
                    if (t.side === u.side || t.hp <= 0) continue;
                    const d = Math.hypot(t.x - u.x, t.y - u.y);
                    if (d < bestD) { bestD = d; target = t; }
                }
            }

            if (!target) continue;
            const hitDist = u.range + (target.kind ? 5 : 2);
            if (bestD <= hitDist) {
                if (u.cd <= 0) {
                    u.cd = u.atkMs;
                    if (u.splash > 0) {
                        room.effects.push({ kind: 'boom', x: target.x, y: target.y, r: u.splash, color: u.color, ttl: 260 });
                        for (const e of room.units) {
                            if (e.side !== u.side && e.hp > 0 && Math.hypot(e.x - target.x, e.y - target.y) <= u.splash) {
                                e.hp -= u.dmg;
                            }
                        }
                        for (const t of room.towers) {
                            if (t.side !== u.side && t.hp > 0 && Math.hypot(t.x - target.x, t.y - target.y) <= u.splash + 5) {
                                t.hp -= u.dmg;
                            }
                        }
                    } else {
                        target.hp -= u.dmg;
                        if (u.range >= 14) {
                            room.effects.push({ kind: 'shot', x1: u.x, y1: u.y, x2: target.x, y2: target.y, color: u.color, ttl: 160 });
                        }
                    }
                }
            } else {
                // Pathfind toward target — cross nearest bridge if on opposite side of the river
                let wx = target.x, wy = target.y;
                const crossingRiver = (u.y > RIVER_Y + 4 && target.y < RIVER_Y - 4) || (u.y < RIVER_Y - 4 && target.y > RIVER_Y + 4);
                if (crossingRiver) {
                    const bX = Math.abs(u.x - BRIDGE_XS[0]) <= Math.abs(u.x - BRIDGE_XS[1]) ? BRIDGE_XS[0] : BRIDGE_XS[1];
                    if (Math.abs(u.x - bX) > 4) {
                        wx = bX;
                        wy = RIVER_Y;
                    }
                }
                const ang = Math.atan2(wy - u.y, wx - u.x);
                u.x += Math.cos(ang) * u.speed * dt;
                u.y += Math.sin(ang) * u.speed * dt;
            }
        }

        // 5. Remove dead units & recount crowns
        room.units = room.units.filter(u => u.hp > 0);
        const s0Destroyed = room.towers.filter(t => t.side === 1 && t.hp <= 0).length;
        const s1Destroyed = room.towers.filter(t => t.side === 0 && t.hp <= 0).length;
        if (room.players[0]) room.players[0].crowns = s0Destroyed;
        if (room.players[1]) room.players[1].crowns = s1Destroyed;

        const king0Dead = room.towers.find(t => t.id === 't0_k').hp <= 0;
        const king1Dead = room.towers.find(t => t.id === 't1_k').hp <= 0;

        if (king1Dead) {
            room.players[0].crowns = 3;
            this._finishMatch(room, room.players[0], `${room.players[0].name} demolished the Saloon Fort (3 Crowns)!`);
            return;
        }
        if (king0Dead) {
            room.players[1].crowns = 3;
            this._finishMatch(room, room.players[1], `${room.players[1].name} demolished the Saloon Fort (3 Crowns)!`);
            return;
        }
        if (remainingMs <= 0) {
            if (s0Destroyed > s1Destroyed) {
                this._finishMatch(room, room.players[0], `${room.players[0].name} wins ${s0Destroyed}-${s1Destroyed} on Crowns!`);
            } else if (s1Destroyed > s0Destroyed) {
                this._finishMatch(room, room.players[1], `${room.players[1].name} wins ${s1Destroyed}-${s0Destroyed} on Crowns!`);
            } else {
                const hp0 = room.towers.filter(t => t.side === 0 && t.hp > 0).reduce((s, t) => s + t.hp, 0);
                const hp1 = room.towers.filter(t => t.side === 1 && t.hp > 0).reduce((s, t) => s + t.hp, 0);
                if (hp0 > hp1) this._finishMatch(room, room.players[0], `${room.players[0].name} wins the tower HP tiebreaker!`);
                else if (hp1 > hp0) this._finishMatch(room, room.players[1], `${room.players[1].name} wins the tower HP tiebreaker!`);
                else this._finishMatch(room, null, 'Draw! Both frontiers held the line.');
            }
            return;
        }

        if (now - room.lastBroadcastAt >= 66) {
            room.lastBroadcastAt = now;
            this._broadcastState(room, 'CLASH_STATE');
        }
    }

    _finishMatch(room, winner, reason) {
        this._stopLoop(room);
        room.state = 'FINISHED';
        const eloChanges = {};

        for (const p of room.players) {
            if (!p.isBot) {
                const opp = room.players.find(o => o.id !== p.id);
                const res = !winner ? 'DRAW' : (winner.id === p.id ? 'WIN' : 'LOSS');
                const change = eloStore.recordMatch(p.profileKey, p.name, opp ? opp.elo : 0, res, Boolean(p.isAccount));
                p.elo = change.newElo;
                p.rank = change.rank;
                eloChanges[p.id] = change;
            }
        }

        for (const p of room.players) {
            if (p.ws && p.ws.readyState === 1) {
                this._send(p.ws, {
                    type: 'CLASH_GAME_OVER',
                    winner: winner ? { id: winner.id, name: winner.name, crowns: winner.crowns } : null,
                    reason,
                    eloChanges,
                    snapshot: this._snapshotFor(room, p),
                });
            }
        }
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
                p.aiThink = updated.aiThink;
            }
        }
        this._startMatch(room);
    }

    _snapshotFor(room, viewer) {
        const remainingMs = room.state === 'PLAYING' ? Math.max(0, room.endsAt - Date.now()) : 0;
        return {
            code: room.code,
            state: room.state,
            side: viewer.side,
            remainingMs,
            doubleElixir: room.state === 'PLAYING' && remainingMs <= DOUBLE_ELIXIR_MS,
            elixir: Number(viewer.elixir.toFixed(2)),
            hand: viewer.hand,
            nextCard: viewer.queue[0] || null,
            players: room.players.map(p => ({
                id: p.id,
                side: p.side,
                name: p.name,
                isBot: p.isBot,
                aiTier: p.aiTier || null,
                elo: p.elo ?? 0,
                crowns: p.crowns || 0,
            })),
            towers: room.towers.map(t => ({
                id: t.id, side: t.side, kind: t.kind, x: t.x, y: t.y, hp: Math.max(0, Math.round(t.hp)), maxHp: t.maxHp,
            })),
            units: room.units.map(u => ({
                id: u.id, cardId: u.cardId, side: u.side, x: Number(u.x.toFixed(1)), y: Number(u.y.toFixed(1)),
                hp: Math.max(0, Math.round(u.hp)), maxHp: u.maxHp, color: u.color,
            })),
            effects: room.effects,
        };
    }

    _send(ws, obj) {
        if (ws && ws.readyState === 1) ws.send(JSON.stringify(obj));
    }

    _broadcastState(room, type) {
        for (const p of room.players) {
            if (p.ws && p.ws.readyState === 1) {
                this._send(p.ws, { type, snapshot: this._snapshotFor(room, p) });
            }
        }
    }
}

module.exports = new ClashEngine();
