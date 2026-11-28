/**
 * MindDrop — Mode 6: Gold Rush 100 (10x10 = 100-Hole Power-Up Connect-4 Territory Battle)
 * Connect 4-in-a-row to charge & unleash custom Power-Ups from your 4-Power-Up Loadout Deck.
 * Fill the 100-hole board (or finish 70 total turns) — most chips on the board wins!
 */

const crypto = require('crypto');
const bloxCloud = require('./bloxCloudClient');
const eloStore = require('./eloStore');

const ROWS = 10;
const COLS = 10;
const MATCH_MS = 180000; // 3-minute match timer — most tiles on the board when time ends wins!
const TURN_MS = 20000;

const POWERUPS = [
    // TIER 4 (4-in-a-Row — 4 Tactical Powers)
    { id: 'double_drop', tier: 4, name: 'Double Drop', target: 'instant', color: '#34d399', desc: '4-in-a-Row: Drop 2 chips on this turn instead of 1.' },
    { id: 'boulder', tier: 4, name: 'Steel Chip', target: 'col', color: '#94a3b8', desc: '4-in-a-Row: Drop an indestructible Steel Chip.' },
    { id: 'sniper_shot', tier: 4, name: 'Sniper Shot', target: 'cell', color: '#f43f5e', desc: '4-in-a-Row: Snipe and destroy any 1 enemy chip on the board.' },
    { id: 'pickpocket', tier: 4, name: 'Pickpocket', target: 'cell', color: '#a855f7', desc: '4-in-a-Row: Flip any 1 enemy chip anywhere to your color.' },

    // TIER 5 (5-in-a-Row — 4 Mid-Game Control Powers)
    { id: 'dynamite', tier: 5, name: 'Dynamite 3x3', target: 'cell', color: '#ef4444', desc: '5-in-a-Row: Blast all enemy chips in a 3x3 area.' },
    { id: 'convert', tier: 5, name: 'Outlaw Convert', target: 'cell', color: '#c084fc', desc: '5-in-a-Row: Flip an enemy chip + up to 2 adjacent.' },
    { id: 'triple_drop', tier: 5, name: 'Triple Drop', target: 'instant', color: '#10b981', desc: '5-in-a-Row: Drop 3 chips in a single turn!' },
    { id: 'twin_steel', tier: 5, name: 'Fortify Pair', target: 'col', color: '#cbd5e1', desc: '5-in-a-Row: Drop 2 stacked indestructible Steel Chips.' },

    // TIER 6 (6-in-a-Row — 4 Heavy Lane & Area Powers)
    { id: 'column_nuke', tier: 6, name: 'Railgun Column', target: 'col', color: '#38bdf8', desc: '6-in-a-Row: Vaporize every enemy chip in a 10-tall column.' },
    { id: 'row_sweep', tier: 6, name: 'Gold Row Sweep', target: 'row', color: '#f59e0b', desc: '6-in-a-Row: Destroy every enemy chip across a 10-wide row.' },
    { id: 'cross_blast', tier: 6, name: 'Crosshair Blast', target: 'cell', color: '#f97316', desc: '6-in-a-Row: Blast a giant 5x5 + cross of enemy chips.' },
    { id: 'vortex_flip', tier: 6, name: 'Vortex Flip 3x3', target: 'cell', color: '#d946ef', desc: '6-in-a-Row: Convert up to 4 enemy chips inside a 3x3 zone.' },

    // TIER 7 (7-in-a-Row — 4 ULTIMATE Superweapons)
    { id: 'quake', tier: 7, name: 'Mega Blast 5x5', target: 'cell', color: '#fb923c', desc: '7-in-a-Row ULTIMATE: Colossal 5x5 blast wiping enemy territory!' },
    { id: 'magnet', tier: 7, name: 'Grand Heist', target: 'instant', color: '#fde047', desc: '7-in-a-Row ULTIMATE: Flip 6 random enemy chips to your color!' },
    { id: 'rail_barrage', tier: 7, name: 'Triple Railgun', target: 'col', color: '#0ea5e9', desc: '7-in-a-Row ULTIMATE: Vaporize enemy chips across 3 full columns!' },
    { id: 'gold_rain', tier: 7, name: 'Gold Rush Rain', target: 'instant', color: '#facc15', desc: '7-in-a-Row ULTIMATE: Rain 4 of your chips across open columns!' },
];

const DEFAULT_LOADOUT = ['double_drop', 'dynamite', 'column_nuke', 'quake'];
const POWERUP_MAP = new Map(POWERUPS.map(p => [p.id, p]));

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

function sanitizeLoadout(raw) {
    // Guarantees exactly 1 Power-Up for each tier: 4, 5, 6, and 7!
    const byTier = { 4: 'double_drop', 5: 'dynamite', 6: 'column_nuke', 7: 'quake' };
    if (Array.isArray(raw)) {
        for (const id of raw) {
            const p = POWERUP_MAP.get(String(id || '').trim());
            if (p && byTier[p.tier]) byTier[p.tier] = p.id;
        }
    }
    return [byTier[4], byTier[5], byTier[6], byTier[7]];
}

function createEmptyBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function applyGravity(board) {
    for (let c = 0; c < COLS; c++) {
        let writeR = ROWS - 1;
        for (let r = ROWS - 1; r >= 0; r--) {
            if (board[r][c]) {
                const cell = board[r][c];
                board[r][c] = null;
                board[writeR][c] = cell;
                writeR--;
            }
        }
    }
}

function findDropRow(board, col) {
    if (col < 0 || col >= COLS) return -1;
    for (let r = ROWS - 1; r >= 0; r--) {
        if (!board[r][col]) return r;
    }
    return -1;
}

function findTierLines(board, side) {
    // Finds all maximal contiguous lines of length >= 4 in all 4 directions, tagged with tier = min(7, length)
    const lines = [];
    const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (!board[r][c] || board[r][c].owner !== side) continue;
            for (const [dr, dc] of dirs) {
                // Only start from the beginning of a contiguous run in this direction
                const pr = r - dr, pc = c - dc;
                if (pr >= 0 && pr < ROWS && pc >= 0 && pc < COLS && board[pr][pc] && board[pr][pc].owner === side) {
                    continue;
                }
                const cells = [];
                let nr = r, nc = c;
                while (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc] && board[nr][nc].owner === side) {
                    cells.push([nr, nc]);
                    nr += dr; nc += dc;
                }
                if (cells.length >= 4) {
                    const tier = Math.min(7, cells.length);
                    const key = `${side}:T${tier}:${cells.map(([rr, cc]) => `${rr}_${cc}`).join('|')}`;
                    lines.push({ key, tier, cells });
                }
            }
        }
    }
    return lines;
}

function countChips(board) {
    let c0 = 0, c1 = 0;
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c]) {
                if (board[r][c].owner === 0) c0++;
                else c1++;
            }
        }
    }
    return { c0, c1, total: c0 + c1 };
}

class Rush100Engine {
    constructor() {
        this.rooms = new Map();
    }

    getPowerups() {
        return POWERUPS;
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
        const aiLoadout = [4, 5, 6, 7].map(tier => {
            const opts = POWERUPS.filter(p => p.tier === tier);
            return opts[Math.floor(Math.random() * opts.length)].id;
        });
        return {
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
            loadout: aiLoadout,
            loadoutIdx: 0,
            earnedPowerups: [],
            foursCount: 0,
        };
    }

    _createRoom(code, isPrivate) {
        const room = {
            code,
            isPrivate,
            state: 'WAITING', // WAITING | PLAYING | FINISHED
            players: [],
            board: createEmptyBoard(),
            scoredLines: new Set(),
            turnSide: 0,
            turnsPlayed: 0,
            dropsLeftThisTurn: 1,
            usedPowerupThisTurn: false,
            turnEndsAt: 0,
            matchEndsAt: 0,
            lastEvent: null,
            timer: null,
            matchTimer: null,
            botTimer: null,
        };
        this.rooms.set(code, room);
        return room;
    }

    joinRush100(ws, { mode = 'quick', roomCode = '', name = 'Gunslinger', profileId = '', authUser = null, loadout = null }) {
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
            loadout: sanitizeLoadout(loadout),
            loadoutIdx: 0,
            earnedPowerups: [],
            foursCount: 0,
        };

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
                this._send(ws, { type: 'R100_ERROR', message: `Room ${cleanCode} is already full (1v1).` });
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
            type: 'R100_JOINED',
            selfId: playerId,
            side: player.side,
            powerups: POWERUPS,
            snapshot: this._snapshotFor(room, player),
        });

        if (room.players.length === 2) {
            this._startMatch(room);
        }

        ws.on('message', (raw) => {
            let msg;
            try { msg = JSON.parse(raw.toString()); } catch { return; }
            if (!msg || typeof msg.type !== 'string') return;

            if (msg.type === 'DROP_CHIP' && room.state === 'PLAYING' && room.turnSide === player.side) {
                this._dropChip(room, player, Number(msg.col));
            } else if (msg.type === 'USE_POWERUP' && room.state === 'PLAYING' && room.turnSide === player.side) {
                this._usePowerup(room, player, String(msg.powerupId || ''), Number(msg.row), Number(msg.col));
            } else if (msg.type === 'REMATCH' && room.state === 'FINISHED' && room.players.length === 2) {
                this._rematch(room);
            }
        });

        ws.on('close', () => {
            room.players = room.players.filter(p => p.id !== playerId);
            const humansLeft = room.players.filter(p => !p.isBot).length;
            if (humansLeft === 0) {
                this._clearAllTimers(room);
                this.rooms.delete(room.code);
                return;
            }
            if (room.state === 'PLAYING') {
                this._finishMatch(room, room.players[0] || null, `${cleanName} left the table!`);
            }
        });
    }

    _clearTimers(room) {
        if (room.timer) { clearTimeout(room.timer); room.timer = null; }
        if (room.botTimer) { clearTimeout(room.botTimer); room.botTimer = null; }
    }

    _clearAllTimers(room) {
        this._clearTimers(room);
        if (room.matchTimer) { clearTimeout(room.matchTimer); room.matchTimer = null; }
    }

    _startMatch(room) {
        this._clearAllTimers(room);
        room.state = 'PLAYING';
        room.board = createEmptyBoard();
        room.scoredLines = new Set();
        room.turnSide = 0;
        room.turnsPlayed = 0;
        room.dropsLeftThisTurn = 1;
        room.usedPowerupThisTurn = false;
        room.matchEndsAt = Date.now() + MATCH_MS;
        room.lastEvent = { type: 'START', text: '3:00 on the clock! Connect 4, 5, 6, or 7 to charge Power-Ups!' };

        room.players.forEach((p, idx) => {
            p.side = idx;
            p.loadoutIdx = 0;
            p.earnedPowerups = [];
            p.foursCount = 0;
        });

        const hasBot = room.players.some(p => p.isBot);
        bloxCloud.recordMatchFormed(hasBot ? 'rush100_ai' : 'rush100_1v1', room.players);

        room.matchTimer = setTimeout(() => {
            if (room.state === 'PLAYING') {
                this._finishByBoardCount(room, true);
            }
        }, MATCH_MS + 100);

        this._beginTurn(room);
    }

    _beginTurn(room) {
        this._clearTimers(room);
        const counts = countChips(room.board);
        if (counts.total >= ROWS * COLS || Date.now() >= room.matchEndsAt) {
            this._finishByBoardCount(room, Date.now() >= room.matchEndsAt);
            return;
        }

        room.dropsLeftThisTurn = 1;
        room.usedPowerupThisTurn = false;
        room.turnEndsAt = Date.now() + TURN_MS;
        this._broadcastSnapshots(room, 'R100_UPDATE');

        const active = room.players[room.turnSide];
        if (active && active.isBot) {
            room.botTimer = setTimeout(() => this._runAiTurn(room, active), 950 + Math.random() * 650);
        }

        room.timer = setTimeout(() => {
            if (room.state !== 'PLAYING') return;
            // Auto-drop in a random open column if timer expires
            const openCols = [];
            for (let c = 0; c < COLS; c++) if (findDropRow(room.board, c) !== -1) openCols.push(c);
            if (openCols.length > 0 && active) {
                this._dropChip(room, active, openCols[Math.floor(Math.random() * openCols.length)]);
            } else {
                this._finishByBoardCount(room);
            }
        }, TURN_MS + 150);
    }

    _awardNewFours(room, player) {
        const lines = findTierLines(room.board, player.side);
        const awarded = []; // { tier, powerupId, cells }
        for (const ln of lines) {
            if (!room.scoredLines.has(ln.key)) {
                room.scoredLines.add(ln.key);
                player.foursCount++;
                // Pick the exact card in player's 4-slot deck matching this tier (4, 5, 6, or 7)!
                const tierIdx = Math.max(0, Math.min(3, ln.tier - 4));
                const powId = player.loadout[tierIdx] || DEFAULT_LOADOUT[tierIdx];
                if (player.earnedPowerups.length < 4) {
                    player.earnedPowerups.push(powId);
                }
                awarded.push({ tier: ln.tier, powerupId: powId, cells: ln.cells });
            }
        }
        return awarded;
    }

    _pruneBrokenLines(room) {
        const stillValid = new Set();
        for (const side of [0, 1]) {
            for (const ln of findTierLines(room.board, side)) {
                if (room.scoredLines.has(ln.key)) stillValid.add(ln.key);
            }
        }
        room.scoredLines = stillValid;
    }

    _dropChip(room, player, col, isSteel = false) {
        const row = findDropRow(room.board, col);
        if (row === -1) return false;
        room.board[row][col] = { owner: player.side, steel: Boolean(isSteel) };
        const awarded = this._awardNewFours(room, player);
        const bestAward = awarded.sort((a, b) => b.tier - a.tier)[0] || null;
        const bestPowName = bestAward && POWERUP_MAP.get(bestAward.powerupId) ? POWERUP_MAP.get(bestAward.powerupId).name : 'Power-Up';

        room.lastEvent = {
            type: bestAward ? 'FOUR_POWERUP' : 'DROP',
            side: player.side,
            row,
            col,
            steel: Boolean(isSteel),
            highlightCells: awarded.flatMap(a => a.cells),
            text: bestAward
                ? `${player.name} hit a ${bestAward.tier}-IN-A-ROW! Charged ${bestPowName} (Tier ${bestAward.tier})!`
                : `${player.name} dropped in column ${col + 1}.`,
        };

        room.dropsLeftThisTurn--;
        const counts = countChips(room.board);
        if (counts.total >= ROWS * COLS) {
            this._finishByBoardCount(room);
            return true;
        }

        if (room.dropsLeftThisTurn > 0) {
            this._broadcastSnapshots(room, 'R100_UPDATE');
            if (player.isBot) {
                room.botTimer = setTimeout(() => this._runAiTurn(room, player), 650);
            }
        } else {
            room.turnsPlayed++;
            room.turnSide = 1 - room.turnSide;
            this._beginTurn(room);
        }
        return true;
    }

    _usePowerup(room, player, powerupId, targetRow, targetCol) {
        if (room.usedPowerupThisTurn) return false;
        const idx = player.earnedPowerups.indexOf(powerupId);
        if (idx === -1) return false;
        const pDef = POWERUP_MAP.get(powerupId);
        if (!pDef) return false;

        const oppSide = 1 - player.side;
        const affected = [];
        let msg = `${player.name} unleashed ${pDef.name}!`;

        if (powerupId === 'double_drop') {
            room.dropsLeftThisTurn += 1;
            msg = `${player.name} activated Double Drop (2 chips this turn)!`;
        } else if (powerupId === 'triple_drop') {
            room.dropsLeftThisTurn += 2;
            msg = `${player.name} activated TRIPLE DROP (3 chips this turn)!`;
        } else if (powerupId === 'boulder') {
            const col = Math.max(0, Math.min(COLS - 1, Number.isInteger(targetCol) ? targetCol : 4));
            const r = findDropRow(room.board, col);
            if (r === -1) return false;
            player.earnedPowerups.splice(idx, 1);
            room.usedPowerupThisTurn = true;
            this._dropChip(room, player, col, true);
            return true;
        } else if (powerupId === 'twin_steel') {
            const col = Math.max(0, Math.min(COLS - 1, Number.isInteger(targetCol) ? targetCol : 4));
            let dropped = 0;
            for (let k = 0; k < 2; k++) {
                const r = findDropRow(room.board, col);
                if (r !== -1) {
                    room.board[r][col] = { owner: player.side, steel: true };
                    affected.push([r, col]);
                    dropped++;
                }
            }
            if (dropped === 0) return false;
            msg = `${player.name} dropped ${dropped} indestructible Steel Chips in Column ${col + 1}!`;
        } else if (powerupId === 'sniper_shot') {
            const r0 = Math.max(0, Math.min(ROWS - 1, Number.isInteger(targetRow) ? targetRow : 5));
            const c0 = Math.max(0, Math.min(COLS - 1, Number.isInteger(targetCol) ? targetCol : 5));
            if (room.board[r0][c0] && room.board[r0][c0].owner === oppSide && !room.board[r0][c0].steel) {
                room.board[r0][c0] = null;
                affected.push([r0, c0]);
                applyGravity(room.board);
            }
            msg = `${player.name} sniped an enemy chip at Row ${r0 + 1}, Col ${c0 + 1}!`;
        } else if (powerupId === 'pickpocket') {
            const r0 = Math.max(0, Math.min(ROWS - 1, Number.isInteger(targetRow) ? targetRow : 5));
            const c0 = Math.max(0, Math.min(COLS - 1, Number.isInteger(targetCol) ? targetCol : 5));
            if (room.board[r0][c0] && room.board[r0][c0].owner === oppSide && !room.board[r0][c0].steel) {
                room.board[r0][c0].owner = player.side;
                affected.push([r0, c0]);
            }
            msg = `${player.name} pickpocketed an enemy chip!`;
        } else if (powerupId === 'dynamite') {
            const r0 = Math.max(0, Math.min(ROWS - 1, Number.isInteger(targetRow) ? targetRow : 5));
            const c0 = Math.max(0, Math.min(COLS - 1, Number.isInteger(targetCol) ? targetCol : 5));
            for (let r = r0 - 1; r <= r0 + 1; r++) {
                for (let c = c0 - 1; c <= c0 + 1; c++) {
                    if (r >= 0 && r < ROWS && c >= 0 && c < COLS && room.board[r][c] && room.board[r][c].owner === oppSide && !room.board[r][c].steel) {
                        room.board[r][c] = null;
                        affected.push([r, c]);
                    }
                }
            }
            applyGravity(room.board);
            msg = `${player.name} blasted ${affected.length} enemy chips with Dynamite 3x3!`;
        } else if (powerupId === 'cross_blast') {
            const r0 = Math.max(0, Math.min(ROWS - 1, Number.isInteger(targetRow) ? targetRow : 5));
            const c0 = Math.max(0, Math.min(COLS - 1, Number.isInteger(targetCol) ? targetCol : 5));
            for (let d = -2; d <= 2; d++) {
                const pts = d === 0 ? [[r0, c0]] : [[r0 + d, c0], [r0, c0 + d]];
                for (const [r, c] of pts) {
                    if (r >= 0 && r < ROWS && c >= 0 && c < COLS && room.board[r][c] && room.board[r][c].owner === oppSide && !room.board[r][c].steel) {
                        room.board[r][c] = null;
                        affected.push([r, c]);
                    }
                }
            }
            applyGravity(room.board);
            msg = `${player.name} fired Crosshair Blast — wiped ${affected.length} enemy chips!`;
        } else if (powerupId === 'vortex_flip') {
            const r0 = Math.max(0, Math.min(ROWS - 1, Number.isInteger(targetRow) ? targetRow : 5));
            const c0 = Math.max(0, Math.min(COLS - 1, Number.isInteger(targetCol) ? targetCol : 5));
            let flipped = 0;
            for (let r = r0 - 1; r <= r0 + 1; r++) {
                for (let c = c0 - 1; c <= c0 + 1; c++) {
                    if (flipped >= 4) break;
                    if (r >= 0 && r < ROWS && c >= 0 && c < COLS && room.board[r][c] && room.board[r][c].owner === oppSide && !room.board[r][c].steel) {
                        room.board[r][c].owner = player.side;
                        affected.push([r, c]);
                        flipped++;
                    }
                }
            }
            msg = `${player.name} unleashed Vortex Flip — converted ${flipped} enemy chips!`;
        } else if (powerupId === 'column_nuke') {
            const col = Math.max(0, Math.min(COLS - 1, Number.isInteger(targetCol) ? targetCol : 4));
            for (let r = 0; r < ROWS; r++) {
                if (room.board[r][col] && room.board[r][col].owner === oppSide && !room.board[r][col].steel) {
                    room.board[r][col] = null;
                    affected.push([r, col]);
                }
            }
            applyGravity(room.board);
            msg = `${player.name} cleared ${affected.length} enemy chips in Column ${col + 1}!`;
        } else if (powerupId === 'rail_barrage') {
            // Tier 7 ULTIMATE: Triple Railgun (3 full columns!)
            const c0 = Math.max(0, Math.min(COLS - 1, Number.isInteger(targetCol) ? targetCol : 4));
            for (let c = Math.max(0, c0 - 1); c <= Math.min(COLS - 1, c0 + 1); c++) {
                for (let r = 0; r < ROWS; r++) {
                    if (room.board[r][c] && room.board[r][c].owner === oppSide && !room.board[r][c].steel) {
                        room.board[r][c] = null;
                        affected.push([r, c]);
                    }
                }
            }
            applyGravity(room.board);
            msg = `${player.name} fired TRIPLE RAILGUN — obliterated ${affected.length} enemy chips across 3 columns!`;
        } else if (powerupId === 'gold_rain') {
            // Tier 7 ULTIMATE: Gold Rush Rain — drops 4 of your chips into random open columns!
            let rained = 0;
            for (let k = 0; k < 4; k++) {
                const openCols = [];
                for (let c = 0; c < COLS; c++) if (findDropRow(room.board, c) !== -1) openCols.push(c);
                if (openCols.length === 0) break;
                const col = openCols[Math.floor(Math.random() * openCols.length)];
                const r = findDropRow(room.board, col);
                room.board[r][col] = { owner: player.side, steel: false };
                affected.push([r, col]);
                rained++;
            }
            msg = `${player.name} summoned GOLD RUSH RAIN — dropped ${rained} bonus chips!`;
        } else if (powerupId === 'row_sweep') {
            const row = Math.max(0, Math.min(ROWS - 1, Number.isInteger(targetRow) ? targetRow : ROWS - 1));
            for (let c = 0; c < COLS; c++) {
                if (room.board[row][c] && room.board[row][c].owner === oppSide && !room.board[row][c].steel) {
                    room.board[row][c] = null;
                    affected.push([row, c]);
                }
            }
            applyGravity(room.board);
            msg = `${player.name} swept ${affected.length} enemy chips across Row ${row + 1}!`;
        } else if (powerupId === 'convert') {
            const r0 = Math.max(0, Math.min(ROWS - 1, Number.isInteger(targetRow) ? targetRow : ROWS - 1));
            const c0 = Math.max(0, Math.min(COLS - 1, Number.isInteger(targetCol) ? targetCol : 4));
            const spots = [[r0, c0], [r0, c0 - 1], [r0, c0 + 1], [r0 - 1, c0], [r0 + 1, c0]];
            let flipped = 0;
            for (const [r, c] of spots) {
                if (flipped >= 3) break;
                if (r >= 0 && r < ROWS && c >= 0 && c < COLS && room.board[r][c] && room.board[r][c].owner === oppSide && !room.board[r][c].steel) {
                    room.board[r][c].owner = player.side;
                    affected.push([r, c]);
                    flipped++;
                }
            }
            msg = `${player.name} converted ${flipped} enemy chips!`;
        } else if (powerupId === 'quake') {
            // Tier 7 ULTIMATE: Mega Blast 5x5!
            const r0 = Math.max(0, Math.min(ROWS - 1, Number.isInteger(targetRow) ? targetRow : 5));
            const c0 = Math.max(0, Math.min(COLS - 1, Number.isInteger(targetCol) ? targetCol : 5));
            for (let r = r0 - 2; r <= r0 + 2; r++) {
                for (let c = c0 - 2; c <= c0 + 2; c++) {
                    if (r >= 0 && r < ROWS && c >= 0 && c < COLS && room.board[r][c] && room.board[r][c].owner === oppSide && !room.board[r][c].steel) {
                        room.board[r][c] = null;
                        affected.push([r, c]);
                    }
                }
            }
            applyGravity(room.board);
            msg = `${player.name} detonated MEGA BLAST 5x5 — wiped ${affected.length} enemy chips!`;
        } else if (powerupId === 'magnet') {
            // Tier 7 ULTIMATE: Grand Heist — flips up to 6 enemy chips across the board!
            const enemies = [];
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    if (room.board[r][c] && room.board[r][c].owner === oppSide && !room.board[r][c].steel) enemies.push([r, c]);
                }
            }
            const picks = shuffle(enemies).slice(0, 6);
            for (const [r, c] of picks) {
                room.board[r][c].owner = player.side;
                affected.push([r, c]);
            }
            msg = `${player.name} pulled off GRAND HEIST — flipped ${affected.length} enemy chips!`;
        }

        player.earnedPowerups.splice(idx, 1);
        room.usedPowerupThisTurn = true;
        this._pruneBrokenLines(room);
        const chainAwarded = this._awardNewFours(room, player);

        room.lastEvent = {
            type: 'POWERUP',
            powerupId,
            side: player.side,
            targetRow: Number.isInteger(targetRow) ? targetRow : 5,
            targetCol: Number.isInteger(targetCol) ? targetCol : 4,
            affected,
            highlightCells: chainAwarded.flatMap(a => a.cells),
            text: chainAwarded.length > 0 ? `${msg} CHAIN COMBO!` : msg,
        };

        this._broadcastSnapshots(room, 'R100_UPDATE');
        return true;
    }

    _runAiTurn(room, bot) {
        if (room.state !== 'PLAYING' || room.turnSide !== bot.side) return;

        // 1. Use an earned power-up if AI has one!
        if (!room.usedPowerupThisTurn && bot.earnedPowerups.length > 0) {
            const powId = bot.earnedPowerups[0];
            const enemies = [];
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    if (room.board[r][c] && room.board[r][c].owner === 0 && !room.board[r][c].steel) enemies.push([r, c]);
                }
            }
            const pick = enemies.length > 0 ? enemies[Math.floor(Math.random() * enemies.length)] : [ROWS - 1, 4];
            this._usePowerup(room, bot, powId, pick[0], pick[1]);
            if (room.turnSide !== bot.side) return; // e.g. boulder finished turn
        }

        // 2. Pick smart column: try to complete 4-in-a-row, else block human 4-in-a-row, else center-biased
        const openCols = [];
        for (let c = 0; c < COLS; c++) if (findDropRow(room.board, c) !== -1) openCols.push(c);
        if (openCols.length === 0) { this._finishByBoardCount(room); return; }

        let chosenCol = null;
        for (const testSide of [bot.side, 0]) {
            for (const c of openCols) {
                const r = findDropRow(room.board, c);
                room.board[r][c] = { owner: testSide, steel: false };
                const lines = findTierLines(room.board, testSide).filter(l => !room.scoredLines.has(l.key));
                room.board[r][c] = null;
                if (lines.length > 0) { chosenCol = c; break; }
            }
            if (chosenCol !== null) break;
        }
        if (chosenCol === null) {
            // Prefer columns near center or adjacent to existing bot chips
            chosenCol = openCols[Math.floor(Math.random() * openCols.length)];
        }
        this._dropChip(room, bot, chosenCol);
    }

    _finishByBoardCount(room, timedOut = false) {
        const { c0, c1 } = countChips(room.board);
        const prefix = timedOut ? "Time's up! " : 'Board full! ';
        let winner = null;
        let reason = `${prefix}Tie game! Both players hold ${c0} tiles on the 100-slot board.`;
        if (c0 > c1) {
            winner = room.players[0];
            reason = `${prefix}${winner.name} wins with ${c0} tiles to ${c1}!`;
        } else if (c1 > c0) {
            winner = room.players[1];
            reason = `${prefix}${winner.name} wins with ${c1} tiles to ${c0}!`;
        }
        this._finishMatch(room, winner, reason);
    }

    _finishMatch(room, winner, reason) {
        this._clearAllTimers(room);
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
                    type: 'R100_GAME_OVER',
                    winner: winner ? { id: winner.id, name: winner.name, side: winner.side } : null,
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
                p.loadout = updated.loadout;
            }
        }
        this._startMatch(room);
    }

    _snapshotFor(room, viewer) {
        const counts = countChips(room.board);
        return {
            code: room.code,
            state: room.state,
            side: viewer.side,
            turnSide: room.turnSide,
            turnsPlayed: room.turnsPlayed,
            matchRemainingMs: room.state === 'PLAYING' ? Math.max(0, room.matchEndsAt - Date.now()) : 0,
            dropsLeftThisTurn: room.dropsLeftThisTurn,
            usedPowerupThisTurn: room.usedPowerupThisTurn,
            timeRemainingMs: room.state === 'PLAYING' ? Math.max(0, room.turnEndsAt - Date.now()) : 0,
            counts,
            board: room.board,
            myPowerups: viewer.earnedPowerups,
            myLoadout: viewer.loadout,
            lastEvent: room.lastEvent,
            players: room.players.map(p => ({
                id: p.id,
                side: p.side,
                name: p.name,
                isBot: p.isBot,
                aiTier: p.aiTier || null,
                elo: p.elo ?? 0,
                foursCount: p.foursCount || 0,
                powerupCount: p.earnedPowerups.length,
            })),
        };
    }

    _send(ws, obj) {
        if (ws && ws.readyState === 1) ws.send(JSON.stringify(obj));
    }

    _broadcastSnapshots(room, type) {
        for (const p of room.players) {
            if (p.ws && p.ws.readyState === 1) {
                this._send(p.ws, { type, snapshot: this._snapshotFor(room, p) });
            }
        }
    }
}

module.exports = new Rush100Engine();
