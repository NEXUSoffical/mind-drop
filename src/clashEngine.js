/**
 * MindDrop — Mode 5: Frontier Clash (Real-Time 2-Lane Wild West Strategy)
 * 16 distinct Wild West cards with unique abilities (Healer, Freeze, Rapid-Fire, Charge, Death-Spawn, Mega Titan),
 * custom 8-card Deck Builder, Gunpowder resource (0-10, 2X Powder final 60s), and Adaptive AI.
 */

const crypto = require('crypto');
const bloxCloud = require('./bloxCloudClient');
const eloStore = require('./eloStore');

const ARENA_W = 100;
const ARENA_H = 160;
const RIVER_Y = 80;
const BRIDGE_XS = [24, 76];
const MATCH_MS = 150000; // 2:30
const DOUBLE_POWDER_MS = 60000;
const MAX_POWDER = 10;
const BASE_POWDER_PER_SEC = 0.42;

const CLASH_CARDS = [
    // COST 2
    { id: 'rattler', name: 'Canyon Rattlers', cost: 2, type: 'troop', count: 4, hp: 75, dmg: 32, range: 5, speed: 17, atkMs: 750, splash: 0, targetBuildings: false, color: '#22c55e', role: '4x Swarm', ability: '4 fast desert vipers that shred tanks' },
    { id: 'tumbleweed', name: 'Spiked Tumbleweed', cost: 2, type: 'spell', radius: 16, dmg: 115, towerDmg: 45, pushback: 10, color: '#a16207', role: 'Knockback Spell', ability: 'Damages & knocks back enemy swarms' },
    // COST 3
    { id: 'bandits', name: 'Outlaw Gang', cost: 3, type: 'troop', count: 3, hp: 140, dmg: 40, range: 6, speed: 15, atkMs: 850, splash: 0, targetBuildings: false, color: '#f97316', role: '3x Bandits', ability: '3 agile masked outlaws' },
    { id: 'gunslinger', name: 'Gunslinger', cost: 3, type: 'troop', count: 1, hp: 250, dmg: 56, range: 26, speed: 11, atkMs: 920, splash: 0, targetBuildings: false, color: '#38bdf8', role: 'Ranged', ability: 'Reliable six-shooter duelist' },
    { id: 'medic', name: 'Frontier Doc', cost: 3, type: 'troop', count: 1, hp: 230, dmg: 30, range: 22, speed: 10, atkMs: 1100, splash: 0, healAmount: 55, healRadius: 18, targetBuildings: false, color: '#10b981', role: 'Healer', ability: 'Heals nearby friendly troops every pulse' },
    // COST 4
    { id: 'bomber', name: 'TNT Bomber', cost: 4, type: 'troop', count: 1, hp: 235, dmg: 86, range: 22, speed: 10.5, atkMs: 1280, splash: 13, targetBuildings: false, color: '#ef4444', role: 'Splash', ability: 'Explosive TNT deals AoE splash damage' },
    { id: 'mustang', name: 'Mustang Rider', cost: 4, type: 'troop', count: 1, hp: 490, dmg: 96, range: 7, speed: 18.5, atkMs: 1080, splash: 0, targetBuildings: true, color: '#d97706', role: 'Fast Siege', ability: 'Sprints straight for enemy towers' },
    { id: 'sniper', name: 'Sharpshooter', cost: 4, type: 'troop', count: 1, hp: 210, dmg: 102, range: 37, speed: 9.5, atkMs: 1420, splash: 0, targetBuildings: false, color: '#c084fc', role: 'Long Range', ability: 'Picks off rivals from across the river' },
    { id: 'barrage', name: 'TNT Barrage', cost: 4, type: 'spell', radius: 18, dmg: 240, towerDmg: 125, color: '#fde047', role: 'AoE Spell', ability: 'Massive explosion anywhere on the map' },
    { id: 'blizzard', name: 'Canyon Freeze', cost: 4, type: 'spell', radius: 20, dmg: 75, towerDmg: 35, freezeMs: 3600, color: '#67e8f9', role: 'Freeze Spell', ability: 'Chills & slows enemies by 65% for 3.6s' },
    // COST 5
    { id: 'brawler', name: 'Iron Brawler', cost: 5, type: 'troop', count: 1, hp: 890, dmg: 92, range: 7, speed: 7.5, atkMs: 1220, splash: 0, targetBuildings: true, color: '#fbbf24', role: 'Heavy Tank', ability: 'Armored juggernaut targeting towers' },
    { id: 'cannon', name: 'Cannon Cart', cost: 5, type: 'troop', count: 1, hp: 480, dmg: 112, range: 28, speed: 8.5, atkMs: 1380, splash: 10, targetBuildings: false, color: '#94a3b8', role: 'Siege Cannon', ability: 'Long-range splash cannonballs' },
    { id: 'gatling', name: 'Gatling Gunner', cost: 5, type: 'troop', count: 1, hp: 360, dmg: 30, range: 25, speed: 8.5, atkMs: 350, splash: 0, targetBuildings: false, color: '#f59e0b', role: 'Rapid Fire', ability: 'Blistering 3 shots/sec rotary gun' },
    // COST 6
    { id: 'bull', name: 'Stampede Bull', cost: 6, type: 'troop', count: 1, hp: 780, dmg: 115, range: 7, speed: 12.5, atkMs: 1150, splash: 10, chargeMult: 2.0, targetBuildings: false, color: '#b91c1c', role: '2x Charge', ability: 'Charges for 2x splash smash on impact' },
    { id: 'wagon', name: 'War Wagon', cost: 6, type: 'troop', count: 1, hp: 920, dmg: 85, range: 22, speed: 8.0, atkMs: 1100, splash: 0, deathSpawn: 'bandits', deathSpawnCount: 2, targetBuildings: false, color: '#b45309', role: 'Spawns 2 Outlaws', ability: 'Armored wagon drops 2 outlaws on death' },
    // COST 7
    { id: 'titan', name: 'Iron Horse Titan', cost: 7, type: 'troop', count: 1, hp: 1620, dmg: 175, range: 9, speed: 6.2, atkMs: 1450, splash: 14, targetBuildings: false, color: '#e11d48', role: 'Mega Boss', ability: 'Colossal steam juggernaut with mega splash' },
];

const DEFAULT_DECK = ['bandits', 'gunslinger', 'brawler', 'bomber', 'mustang', 'sniper', 'cannon', 'barrage'];
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

function sanitizeDeck(rawDeck) {
    if (!Array.isArray(rawDeck)) return DEFAULT_DECK.slice();
    const unique = [];
    for (const id of rawDeck) {
        const clean = String(id || '').trim();
        if (CARD_MAP.has(clean) && !unique.includes(clean)) unique.push(clean);
        if (unique.length === 8) break;
    }
    if (unique.length < 8) {
        for (const fallback of DEFAULT_DECK) {
            if (!unique.includes(fallback)) unique.push(fallback);
            if (unique.length === 8) break;
        }
    }
    return unique;
}

function makeTowers() {
    return [
        // Side 0 (Bottom)
        { id: 't0_l', side: 0, kind: 'outpost', x: 24, y: 128, hp: 950, maxHp: 950, range: 30, dmg: 50, atkMs: 900, cd: 0, slowUntil: 0 },
        { id: 't0_r', side: 0, kind: 'outpost', x: 76, y: 128, hp: 950, maxHp: 950, range: 30, dmg: 50, atkMs: 900, cd: 0, slowUntil: 0 },
        { id: 't0_k', side: 0, kind: 'king', x: 50, y: 146, hp: 1900, maxHp: 1900, range: 32, dmg: 66, atkMs: 1000, cd: 0, slowUntil: 0 },
        // Side 1 (Top)
        { id: 't1_l', side: 1, kind: 'outpost', x: 24, y: 32, hp: 950, maxHp: 950, range: 30, dmg: 50, atkMs: 900, cd: 0, slowUntil: 0 },
        { id: 't1_r', side: 1, kind: 'outpost', x: 76, y: 32, hp: 950, maxHp: 950, range: 30, dmg: 50, atkMs: 900, cd: 0, slowUntil: 0 },
        { id: 't1_k', side: 1, kind: 'king', x: 50, y: 14, hp: 1900, maxHp: 1900, range: 32, dmg: 66, atkMs: 1000, cd: 0, slowUntil: 0 },
    ];
}

class ClashEngine {
    constructor() {
        this.rooms = new Map();
    }

    getCards() {
        return CLASH_CARDS;
    }

    getStats() {
        let players = 0;
        for (const r of this.rooms.values()) {
            players += r.players.filter(p => !p.isBot).length;
        }
        return { rooms: this.rooms.size, players };
    }

    _initDeckForPlayer(p) {
        const deck = shuffle(sanitizeDeck(p.deck));
        p.hand = deck.slice(0, 4);
        p.queue = deck.slice(4);
        p.powder = 5.0;
        p.stars = 0;
    }

    _buildAiPlayer(humanElo) {
        const tier = eloStore.getAiTierForElo(humanElo);
        const thinkBySkill = {
            easy: { minMs: 3600, maxMs: 5600 },
            medium: { minMs: 2600, maxMs: 4200 },
            hard: { minMs: 1900, maxMs: 3200 },
            grandmaster: { minMs: 1300, maxMs: 2300 },
        };
        const aiDeck = shuffle(CLASH_CARDS.map(c => c.id)).slice(0, 8);
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
            deck: aiDeck,
            hand: [],
            queue: [],
            powder: 5.0,
            stars: 0,
        };
        this._initDeckForPlayer(ai);
        return ai;
    }

    _createRoom(code, isPrivate) {
        const room = {
            code,
            isPrivate,
            state: 'WAITING',
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

    joinClash(ws, { mode = 'quick', roomCode = '', name = 'Gunslinger', profileId = '', authUser = null, deck = null }) {
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
            deck: sanitizeDeck(deck),
            hand: [],
            queue: [],
            powder: 5.0,
            stars: 0,
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
            if (!room) room = this._createRoom(cleanCode, true);
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
            if (!room) room = this._createRoom(makeCode(), false);
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

    _spawnTroop(room, card, side, x, y) {
        room.units.push({
            id: room.nextUnitId++,
            cardId: card.id,
            side,
            x: Math.max(6, Math.min(ARENA_W - 6, x)),
            y: Math.max(8, Math.min(ARENA_H - 8, y)),
            hp: card.hp,
            maxHp: card.hp,
            dmg: card.dmg,
            range: card.range,
            speed: card.speed,
            atkMs: card.atkMs,
            splash: card.splash || 0,
            healAmount: card.healAmount || 0,
            healRadius: card.healRadius || 0,
            healCd: 1400,
            chargeReady: Boolean(card.chargeMult),
            chargeMult: card.chargeMult || 1,
            deathSpawn: card.deathSpawn || null,
            deathSpawnCount: card.deathSpawnCount || 0,
            targetBuildings: Boolean(card.targetBuildings),
            color: card.color,
            slowUntil: 0,
            cd: 250,
        });
    }

    _deployCard(room, player, cardId, rawX, rawY) {
        const card = CARD_MAP.get(cardId);
        if (!card) return;
        const handIdx = player.hand.indexOf(cardId);
        if (handIdx === -1) return;
        if (player.powder + 0.01 < card.cost) return;

        let x = Math.max(6, Math.min(ARENA_W - 6, Number.isFinite(rawX) ? rawX : 50));
        let y = Math.max(8, Math.min(ARENA_H - 8, Number.isFinite(rawY) ? rawY : (player.side === 0 ? 115 : 45)));

        if (card.type === 'troop') {
            if (player.side === 0) y = Math.max(RIVER_Y + 6, Math.min(ARENA_H - 12, y));
            else y = Math.max(12, Math.min(RIVER_Y - 6, y));
        }

        player.powder = Math.max(0, player.powder - card.cost);
        const nextCard = player.queue.shift();
        player.hand[handIdx] = nextCard;
        player.queue.push(cardId);

        if (card.type === 'spell') {
            const now = Date.now();
            room.effects.push({ kind: card.freezeMs ? 'freeze' : 'boom', x, y, r: card.radius, color: card.color, ttl: card.freezeMs ? 900 : 550 });
            for (const u of room.units) {
                if (u.side !== player.side && u.hp > 0 && Math.hypot(u.x - x, u.y - y) <= card.radius) {
                    u.hp -= card.dmg;
                    if (card.freezeMs) u.slowUntil = Math.max(u.slowUntil, now + card.freezeMs);
                    if (card.pushback) {
                        const dirY = player.side === 0 ? -1 : 1;
                        u.y = Math.max(10, Math.min(ARENA_H - 10, u.y + dirY * card.pushback));
                    }
                }
            }
            for (const t of room.towers) {
                if (t.side !== player.side && t.hp > 0 && Math.hypot(t.x - x, t.y - y) <= card.radius + 6) {
                    t.hp -= card.towerDmg;
                    if (card.freezeMs) t.slowUntil = Math.max(t.slowUntil, now + card.freezeMs);
                }
            }
            return;
        }

        const count = card.count || 1;
        for (let i = 0; i < count; i++) {
            const angle = (i / Math.max(1, count)) * Math.PI * 2;
            const spread = count > 1 ? 5.2 : 0;
            this._spawnTroop(room, card, player.side, x + Math.cos(angle) * spread, y + Math.sin(angle) * spread);
        }
        room.effects.push({ kind: 'spawn', x, y, r: 10, color: card.color, ttl: 320 });
    }

    _aiStep(room, bot, now) {
        if (now < bot.nextThinkAt) return;
        const affordable = bot.hand.map(id => CARD_MAP.get(id)).filter(c => c && bot.powder >= c.cost);
        if (affordable.length === 0) return;

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
        } else if (bot.powder >= 7.5) {
            const heavy = affordable.sort((a, b) => b.cost - a.cost)[0];
            pick = heavy;
            dx = Math.random() < 0.5 ? 24 : 76;
            dy = 64;
        } else if (bot.powder < 5.5) {
            return;
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
        const doublePowder = remainingMs <= DOUBLE_POWDER_MS;
        const powderRate = BASE_POWDER_PER_SEC * (doublePowder ? 2 : 1);

        for (const p of room.players) {
            p.powder = Math.min(MAX_POWDER, p.powder + powderRate * dt);
            if (p.isBot) this._aiStep(room, p, now);
        }

        for (let i = room.effects.length - 1; i >= 0; i--) {
            room.effects[i].ttl -= dtMs;
            if (room.effects[i].ttl <= 0) room.effects.splice(i, 1);
        }

        // Towers fire
        for (const t of room.towers) {
            if (t.hp <= 0) continue;
            const slowMult = now < t.slowUntil ? 0.35 : 1;
            t.cd = Math.max(0, t.cd - dtMs * slowMult);
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

        // Units act
        for (const u of room.units) {
            if (u.hp <= 0) continue;
            const slowMult = now < u.slowUntil ? 0.35 : 1;
            u.cd = Math.max(0, u.cd - dtMs * slowMult);

            // Healer ability pulse (Frontier Doc)
            if (u.healAmount > 0) {
                u.healCd -= dtMs * slowMult;
                if (u.healCd <= 0) {
                    u.healCd = 1500;
                    let healedAny = false;
                    for (const ally of room.units) {
                        if (ally.side === u.side && ally.hp > 0 && ally.hp < ally.maxHp && Math.hypot(ally.x - u.x, ally.y - u.y) <= u.healRadius) {
                            ally.hp = Math.min(ally.maxHp, ally.hp + u.healAmount);
                            healedAny = true;
                        }
                    }
                    if (healedAny) room.effects.push({ kind: 'heal', x: u.x, y: u.y, r: u.healRadius, color: '#34d399', ttl: 380 });
                }
            }

            let target = null;
            let bestD = Infinity;
            if (!u.targetBuildings) {
                const aggro = Math.max(26, u.range + 8);
                for (const e of room.units) {
                    if (e.side === u.side || e.hp <= 0) continue;
                    const d = Math.hypot(e.x - u.x, e.y - u.y);
                    if (d < aggro && d < bestD) { bestD = d; target = e; }
                }
            }
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
                    const dmgNow = u.chargeReady ? Math.round(u.dmg * u.chargeMult) : u.dmg;
                    if (u.chargeReady) u.chargeReady = false;

                    if (u.splash > 0) {
                        room.effects.push({ kind: 'boom', x: target.x, y: target.y, r: u.splash, color: u.color, ttl: 260 });
                        for (const e of room.units) {
                            if (e.side !== u.side && e.hp > 0 && Math.hypot(e.x - target.x, e.y - target.y) <= u.splash) {
                                e.hp -= dmgNow;
                            }
                        }
                        for (const t of room.towers) {
                            if (t.side !== u.side && t.hp > 0 && Math.hypot(t.x - target.x, t.y - target.y) <= u.splash + 5) {
                                t.hp -= dmgNow;
                            }
                        }
                    } else {
                        target.hp -= dmgNow;
                        if (u.range >= 14) {
                            room.effects.push({ kind: 'shot', x1: u.x, y1: u.y, x2: target.x, y2: target.y, color: u.color, ttl: 150 });
                        }
                    }
                }
            } else {
                let wx = target.x, wy = target.y;
                const crossingRiver = (u.y > RIVER_Y + 4 && target.y < RIVER_Y - 4) || (u.y < RIVER_Y - 4 && target.y > RIVER_Y + 4);
                if (crossingRiver) {
                    const bX = Math.abs(u.x - BRIDGE_XS[0]) <= Math.abs(u.x - BRIDGE_XS[1]) ? BRIDGE_XS[0] : BRIDGE_XS[1];
                    if (Math.abs(u.x - bX) > 4) { wx = bX; wy = RIVER_Y; }
                }
                const ang = Math.atan2(wy - u.y, wx - u.x);
                const spd = u.speed * (u.chargeReady ? 1.45 : 1) * slowMult;
                u.x += Math.cos(ang) * spd * dt;
                u.y += Math.sin(ang) * spd * dt;
            }
        }

        // Handle Death-Spawn units (e.g., War Wagon drops 2 Outlaws when destroyed!)
        const newlyDead = room.units.filter(u => u.hp <= 0);
        room.units = room.units.filter(u => u.hp > 0);
        for (const dead of newlyDead) {
            if (dead.deathSpawn && dead.deathSpawnCount > 0) {
                const spawnCard = CARD_MAP.get(dead.deathSpawn);
                if (spawnCard) {
                    for (let k = 0; k < dead.deathSpawnCount; k++) {
                        this._spawnTroop(room, spawnCard, dead.side, dead.x + (k === 0 ? -4 : 4), dead.y);
                    }
                    room.effects.push({ kind: 'spawn', x: dead.x, y: dead.y, r: 10, color: '#fbbf24', ttl: 300 });
                }
            }
        }

        const s0Destroyed = room.towers.filter(t => t.side === 1 && t.hp <= 0).length;
        const s1Destroyed = room.towers.filter(t => t.side === 0 && t.hp <= 0).length;
        if (room.players[0]) room.players[0].stars = s0Destroyed;
        if (room.players[1]) room.players[1].stars = s1Destroyed;

        const king0Dead = room.towers.find(t => t.id === 't0_k').hp <= 0;
        const king1Dead = room.towers.find(t => t.id === 't1_k').hp <= 0;

        if (king1Dead) {
            room.players[0].stars = 3;
            this._finishMatch(room, room.players[0], `${room.players[0].name} demolished the Saloon Fort (3 Stars)!`);
            return;
        }
        if (king0Dead) {
            room.players[1].stars = 3;
            this._finishMatch(room, room.players[1], `${room.players[1].name} demolished the Saloon Fort (3 Stars)!`);
            return;
        }
        if (remainingMs <= 0) {
            if (s0Destroyed > s1Destroyed) {
                this._finishMatch(room, room.players[0], `${room.players[0].name} wins ${s0Destroyed}-${s1Destroyed} on Stars!`);
            } else if (s1Destroyed > s0Destroyed) {
                this._finishMatch(room, room.players[1], `${room.players[1].name} wins ${s1Destroyed}-${s0Destroyed} on Stars!`);
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
                    winner: winner ? { id: winner.id, name: winner.name, stars: winner.stars } : null,
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
                p.deck = updated.deck;
            }
        }
        this._startMatch(room);
    }

    _snapshotFor(room, viewer) {
        const remainingMs = room.state === 'PLAYING' ? Math.max(0, room.endsAt - Date.now()) : 0;
        const now = Date.now();
        return {
            code: room.code,
            state: room.state,
            side: viewer.side,
            remainingMs,
            doublePowder: room.state === 'PLAYING' && remainingMs <= DOUBLE_POWDER_MS,
            powder: Number(viewer.powder.toFixed(2)),
            hand: viewer.hand,
            nextCard: viewer.queue[0] || null,
            players: room.players.map(p => ({
                id: p.id,
                side: p.side,
                name: p.name,
                isBot: p.isBot,
                aiTier: p.aiTier || null,
                elo: p.elo ?? 0,
                stars: p.stars || 0,
            })),
            towers: room.towers.map(t => ({
                id: t.id, side: t.side, kind: t.kind, x: t.x, y: t.y,
                hp: Math.max(0, Math.round(t.hp)), maxHp: t.maxHp,
                chilled: now < t.slowUntil,
            })),
            units: room.units.map(u => ({
                id: u.id, cardId: u.cardId, side: u.side,
                x: Number(u.x.toFixed(1)), y: Number(u.y.toFixed(1)),
                hp: Math.max(0, Math.round(u.hp)), maxHp: u.maxHp,
                color: u.color, chilled: now < u.slowUntil, charging: u.chargeReady,
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
