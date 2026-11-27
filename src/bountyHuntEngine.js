/**
 * MindDrop — Mode 4: Bounty Hunt (Multiplayer Hidden-Object Race)
 * First gunslinger to spot all 10 hidden Wild West items in the scene wins!
 * Supports 2-8 players (online quick match, private friend rooms) OR instant 1v1 vs Adaptive AI.
 */

const crypto = require('crypto');
const bloxCloud = require('./bloxCloudClient');
const eloStore = require('./eloStore');

const TARGET_COUNT = 10;
const DECOY_COUNT = 10;
const HIT_RADIUS = 0.055; // normalized canvas distance
const MISS_PENALTY_MS = 1100;
const MAX_PLAYERS = 8;

const ITEM_CATALOG = [
    { id: 'sheriff_star', name: 'Sheriff Star' },
    { id: 'pocket_watch', name: 'Pocket Watch' },
    { id: 'horseshoe', name: 'Horseshoe' },
    { id: 'dynamite', name: 'Dynamite' },
    { id: 'gold_bar', name: 'Gold Bar' },
    { id: 'revolver', name: 'Six-Shooter' },
    { id: 'cowboy_hat', name: 'Cowboy Hat' },
    { id: 'lantern', name: 'Oil Lantern' },
    { id: 'compass', name: 'Compass' },
    { id: 'boot', name: 'Cowboy Boot' },
    { id: 'whiskey', name: 'Saloon Jug' },
    { id: 'key', name: 'Jail Key' },
    { id: 'coin_bag', name: 'Money Bag' },
    { id: 'ace_card', name: 'Ace Card' },
    { id: 'wanted_scroll', name: 'Wanted Scroll' },
    { id: 'lasso', name: 'Rope Lasso' },
    { id: 'cactus', name: 'Mini Cactus' },
    { id: 'spyglass', name: 'Spyglass' },
    { id: 'canteen', name: 'Canteen' },
    { id: 'pickaxe', name: 'Pickaxe' },
    { id: 'magnet', name: 'Red Magnet' },
    { id: 'feather', name: 'Hawk Feather' },
    { id: 'skull', name: 'Bull Skull' },
    { id: 'wheel', name: 'Wagon Wheel' },
];

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

const BOUNTY_SCENES = [
    { id: 'saloon', name: 'Sunset Saloon', image: '/bounty-scene-saloon.jpg?v=1' },
    { id: 'mine', name: 'Gold Mine Camp', image: '/bounty-scene-mine.jpg?v=1' },
    { id: 'sheriff', name: "Sheriff's Office", image: '/bounty-scene-sheriff.jpg?v=1' },
    { id: 'train', name: 'Frontier Train Depot', image: '/bounty-scene-train.jpg?v=1' },
    { id: 'blacksmith', name: 'Blacksmith & Stable', image: '/bounty-scene-blacksmith.jpg?v=1' },
    { id: 'canyon', name: 'Desert Ghost Town', image: '/bounty-scene-canyon.jpg?v=1' },
];

// Grounded hiding spots across foreground tables/crates/barrels, mid-ground shelves/counters, and upper rafters/ledges
const SALOON_SPOTS = [
    // Left bar shelves, counter & crates
    { x: 0.08, y: 0.23, scale: 0.68 }, // upper left basket/bottles
    { x: 0.16, y: 0.27, scale: 0.66 }, // top bar shelf bottles
    { x: 0.05, y: 0.45, scale: 0.68 }, // behind bar middle shelf
    { x: 0.11, y: 0.56, scale: 0.68 }, // behind bar lower shelf
    { x: 0.22, y: 0.57, scale: 0.70 }, // wooden bar counter front
    { x: 0.28, y: 0.51, scale: 0.66 }, // wooden bar counter mid
    { x: 0.06, y: 0.78, scale: 0.74 }, // bottom-left barrel top
    { x: 0.20, y: 0.80, scale: 0.72 }, // wooden crate next to bar
    { x: 0.30, y: 0.88, scale: 0.74 }, // floor pile near bar stools
    { x: 0.35, y: 0.69, scale: 0.66 }, // bar stool seat
    // Ceiling beams, chandelier & back wall
    { x: 0.30, y: 0.14, scale: 0.64 }, // left ceiling rafter
    { x: 0.44, y: 0.16, scale: 0.64 }, // chandelier left rim
    { x: 0.56, y: 0.15, scale: 0.64 }, // chandelier right rim
    { x: 0.38, y: 0.35, scale: 0.62 }, // wall between left windows
    { x: 0.53, y: 0.33, scale: 0.62 }, // back wall above stairs
    { x: 0.61, y: 0.41, scale: 0.64 }, // stair wall frame area
    // Center poker tables & rug
    { x: 0.48, y: 0.58, scale: 0.66 }, // back poker table
    { x: 0.43, y: 0.69, scale: 0.68 }, // rug near back table
    { x: 0.60, y: 0.67, scale: 0.72 }, // front poker table felt
    { x: 0.55, y: 0.76, scale: 0.70 }, // front chair seat
    { x: 0.50, y: 0.87, scale: 0.74 }, // patterned rug foreground
    { x: 0.65, y: 0.86, scale: 0.74 }, // rug beside front chair
    // Right balcony, general store shelves & barrels
    { x: 0.72, y: 0.26, scale: 0.62 }, // balcony railing left
    { x: 0.82, y: 0.22, scale: 0.64 }, // upper balcony shelf
    { x: 0.93, y: 0.26, scale: 0.64 }, // far-right upper shelf
    { x: 0.70, y: 0.46, scale: 0.66 }, // store shelf mid-left
    { x: 0.76, y: 0.54, scale: 0.68 }, // store shelf mid
    { x: 0.88, y: 0.47, scale: 0.68 }, // store shelf mid-right
    { x: 0.94, y: 0.56, scale: 0.68 }, // far-right store shelf
    { x: 0.71, y: 0.66, scale: 0.70 }, // burlap sacks near stairs
    { x: 0.83, y: 0.75, scale: 0.72 }, // crates & boots area
    { x: 0.92, y: 0.85, scale: 0.76 }, // foreground right barrel
];

function generateSceneObjects() {
    const picked = shuffle(ITEM_CATALOG).slice(0, TARGET_COUNT + DECOY_COUNT);
    const chosenSpots = shuffle(SALOON_SPOTS).slice(0, picked.length);
    const placed = [];

    for (let i = 0; i < picked.length; i++) {
        const item = picked[i];
        const spot = chosenSpots[i];
        const jx = (Math.random() - 0.5) * 0.018;
        const jy = (Math.random() - 0.5) * 0.018;
        placed.push({
            id: item.id,
            name: item.name,
            isTarget: i < TARGET_COUNT,
            x: Number(Math.max(0.04, Math.min(0.96, spot.x + jx)).toFixed(4)),
            y: Number(Math.max(0.08, Math.min(0.92, spot.y + jy)).toFixed(4)),
            rot: Number(((Math.random() - 0.5) * 0.65).toFixed(3)),
            scale: Number((spot.scale * (0.92 + Math.random() * 0.16)).toFixed(2)),
        });
    }
    return {
        objects: shuffle(placed),
        targets: picked.slice(0, TARGET_COUNT),
    };
}

class BountyHuntEngine {
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

    _buildAiPlayer(humanElo) {
        const tier = eloStore.getAiTierForElo(humanElo);
        const paceBySkill = {
            easy: { minMs: 4800, maxMs: 8500 },
            medium: { minMs: 3600, maxMs: 6400 },
            hard: { minMs: 2600, maxMs: 4800 },
            grandmaster: { minMs: 1900, maxMs: 3500 },
        };
        const pace = paceBySkill[tier.skill] || paceBySkill.easy;
        return {
            id: 'bot_' + crypto.randomBytes(3).toString('hex'),
            profileKey: 'bot',
            name: tier.botName,
            ws: null,
            isBot: true,
            isAccount: false,
            elo: tier.botElo,
            rank: eloStore.getRankForElo(tier.botElo),
            aiTier: tier.label,
            aiSkill: tier.skill,
            aiPace: pace,
            foundIds: [],
            lockUntil: 0,
        };
    }

    _createRoom(code, isPrivate) {
        const room = {
            code,
            isPrivate,
            state: 'WAITING', // WAITING | PLAYING | FINISHED
            hostId: null,
            players: [],
            scene: BOUNTY_SCENES[0],
            lastSceneId: null,
            objects: [],
            targets: [],
            startedAt: 0,
            botTimer: null,
        };
        this.rooms.set(code, room);
        return room;
    }

    joinBountyHunt(ws, { mode = 'quick', roomCode = '', name = 'Gunslinger', profileId = '', authUser = null }) {
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
            foundIds: [],
            lockUntil: 0,
        };

        let room = null;
        const cleanCode = String(roomCode || '').trim().toUpperCase().slice(0, 12);

        if (mode === 'ai') {
            room = this._createRoom(makeCode(), true);
            room.hostId = playerId;
            room.players.push(player);
            room.players.push(this._buildAiPlayer(profile.elo));
        } else if (mode === 'private' && cleanCode) {
            room = this.rooms.get(cleanCode);
            if (!room) {
                room = this._createRoom(cleanCode, true);
                room.hostId = playerId;
            }
            if (room.state === 'PLAYING') {
                this._send(ws, { type: 'BH_ERROR', message: `Room ${cleanCode} is already mid-hunt.` });
                ws.close();
                return;
            }
            if (room.players.length >= MAX_PLAYERS) {
                this._send(ws, { type: 'BH_ERROR', message: `Room ${cleanCode} is full (${MAX_PLAYERS} max).` });
                ws.close();
                return;
            }
            room.players.push(player);
        } else {
            for (const r of this.rooms.values()) {
                if (!r.isPrivate && r.state === 'WAITING' && r.players.length < 2) {
                    room = r;
                    break;
                }
            }
            if (!room) {
                room = this._createRoom(makeCode(), false);
                room.hostId = playerId;
            }
            room.players.push(player);
        }

        this._send(ws, { type: 'BH_JOINED', selfId: playerId, snapshot: this._snapshot(room, playerId) });
        this._broadcastSnapshots(room, 'BH_UPDATE');

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
            } else if (msg.type === 'CLICK_SPOT' && room.state === 'PLAYING') {
                this._handleClick(room, player, Number(msg.x), Number(msg.y));
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
            if (room.state === 'PLAYING' && room.players.length < 2) {
                this._finishMatch(room, room.players[0] || null, `${cleanName} fled the bounty hunt!`);
            } else {
                this._broadcastSnapshots(room, 'BH_UPDATE');
            }
        });
    }

    _clearTimers(room) {
        if (room.botTimer) { clearTimeout(room.botTimer); room.botTimer = null; }
    }

    _startMatch(room) {
        if (room.players.length < 2) return;
        this._clearTimers(room);
        room.state = 'PLAYING';
        room.startedAt = Date.now();
        const pool = BOUNTY_SCENES.filter(s => s.id !== room.lastSceneId);
        const chosenScene = pool[Math.floor(Math.random() * pool.length)] || BOUNTY_SCENES[0];
        room.scene = chosenScene;
        room.lastSceneId = chosenScene.id;
        const scene = generateSceneObjects();
        room.objects = scene.objects;
        room.targets = scene.targets;
        for (const p of room.players) {
            p.foundIds = [];
            p.lockUntil = 0;
        }

        const hasBot = room.players.some(p => p.isBot);
        const qType = hasBot ? 'bounty_ai' : (room.players.length > 2 ? 'bounty_party' : 'bounty_1v1');
        bloxCloud.recordMatchFormed(qType, room.players);

        this._broadcastSnapshots(room, 'BH_START');
        this._scheduleBotFind(room);
    }

    _scheduleBotFind(room) {
        this._clearTimers(room);
        if (room.state !== 'PLAYING') return;
        const bot = room.players.find(p => p.isBot);
        if (!bot || !bot.aiPace) return;
        const remaining = room.targets.filter(t => !bot.foundIds.includes(t.id));
        if (remaining.length === 0) return;

        const delay = bot.aiPace.minMs + Math.random() * (bot.aiPace.maxMs - bot.aiPace.minMs);
        room.botTimer = setTimeout(() => {
            if (room.state !== 'PLAYING') return;
            const pick = remaining[Math.floor(Math.random() * remaining.length)];
            bot.foundIds.push(pick.id);
            this._broadcastSnapshots(room, 'BH_UPDATE');
            if (bot.foundIds.length >= TARGET_COUNT) {
                const secs = ((Date.now() - room.startedAt) / 1000).toFixed(1);
                this._finishMatch(room, bot, `${bot.name} found all ${TARGET_COUNT} items in ${secs}s!`);
            } else {
                this._scheduleBotFind(room);
            }
        }, delay);
    }

    _handleClick(room, player, nx, ny) {
        if (room.state !== 'PLAYING') return;
        if (!Number.isFinite(nx) || !Number.isFinite(ny)) return;
        const now = Date.now();
        if (now < player.lockUntil) return;

        // Check closest unfound target within hit radius
        let hit = null;
        let bestDist = HIT_RADIUS;
        for (const obj of room.objects) {
            if (!obj.isTarget) continue;
            if (player.foundIds.includes(obj.id)) continue;
            const d = Math.hypot(obj.x - nx, obj.y - ny);
            if (d <= bestDist) {
                bestDist = d;
                hit = obj;
            }
        }

        if (hit) {
            player.foundIds.push(hit.id);
            this._send(player.ws, {
                type: 'BH_FOUND',
                item: { id: hit.id, name: hit.name, x: hit.x, y: hit.y },
                snapshot: this._snapshot(room, player.id),
            });
            // Broadcast updated progress to everyone else
            for (const other of room.players) {
                if (other.id !== player.id && other.ws && other.ws.readyState === 1) {
                    this._send(other.ws, { type: 'BH_UPDATE', snapshot: this._snapshot(room, other.id) });
                }
            }
            if (player.foundIds.length >= TARGET_COUNT) {
                const secs = ((Date.now() - room.startedAt) / 1000).toFixed(1);
                this._finishMatch(room, player, `${player.name} found all ${TARGET_COUNT} items in ${secs}s!`);
            }
        } else {
            player.lockUntil = now + MISS_PENALTY_MS;
            this._send(player.ws, {
                type: 'BH_MISS',
                x: nx,
                y: ny,
                penaltyMs: MISS_PENALTY_MS,
            });
        }
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

        for (const p of room.players) {
            if (p.ws && p.ws.readyState === 1) {
                this._send(p.ws, {
                    type: 'BH_GAME_OVER',
                    winner: winner ? { id: winner.id, name: winner.name, found: winner.foundIds.length } : null,
                    reason,
                    eloChanges,
                    snapshot: this._snapshot(room, p.id),
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
                p.aiPace = updated.aiPace;
            }
        }
        this._startMatch(room);
    }

    _snapshot(room, viewerId) {
        const viewer = room.players.find(p => p.id === viewerId);
        return {
            code: room.code,
            state: room.state,
            hostId: room.hostId,
            targetCount: TARGET_COUNT,
            scene: room.scene || BOUNTY_SCENES[0],
            objects: room.state === 'WAITING' ? [] : room.objects,
            targets: room.state === 'WAITING' ? [] : room.targets,
            myFoundIds: viewer ? viewer.foundIds : [],
            players: room.players.map(p => ({
                id: p.id,
                name: p.name,
                isBot: p.isBot,
                aiTier: p.aiTier || null,
                elo: p.elo ?? 0,
                rank: p.rank,
                foundCount: p.foundIds.length,
            })),
        };
    }

    _send(ws, obj) {
        if (ws && ws.readyState === 1) ws.send(JSON.stringify(obj));
    }

    _broadcastSnapshots(room, type) {
        for (const p of room.players) {
            if (p.ws && p.ws.readyState === 1) {
                this._send(p.ws, { type, snapshot: this._snapshot(room, p.id) });
            }
        }
    }
}

module.exports = new BountyHuntEngine();
