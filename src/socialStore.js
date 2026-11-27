/**
 * MindDrop Friends List, Online Presence & Real-Time Game Invites
 * Persisted in BloxCloud Cloud DataStore (minddrop/social) + local JSON fallback.
 */

const fs = require('fs');
const path = require('path');
const bloxCloud = require('./bloxCloudClient');
const authStore = require('./authStore');
const eloStore = require('./eloStore');

const DATA_DIR = path.join(__dirname, '../data');
const SOCIAL_FILE = path.join(DATA_DIR, 'social.json');

class SocialStore {
    constructor() {
        this.state = {
            friends: {},  // userId -> [friendUserId, ...]
            incoming: {}, // userId -> [{ fromId, fromUsername, createdAt }]
        };
        this.onlineSockets = new Map(); // userId -> Set<ws>
        this._load();
    }

    _load() {
        try {
            if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
            if (fs.existsSync(SOCIAL_FILE)) {
                const parsed = JSON.parse(fs.readFileSync(SOCIAL_FILE, 'utf8'));
                if (parsed && typeof parsed === 'object') {
                    this.state.friends = parsed.friends || {};
                    this.state.incoming = parsed.incoming || {};
                }
            }
        } catch {}
    }

    async initCloud() {
        if (!bloxCloud.isEnabled()) return;
        const remote = await bloxCloud.getJson('minddrop', 'social');
        if (remote && typeof remote === 'object') {
            this.state.friends = { ...this.state.friends, ...(remote.friends || {}) };
            this.state.incoming = { ...this.state.incoming, ...(remote.incoming || {}) };
            console.log('[MindDrop Social] Hydrated friends & requests from BloxCloud Cloud DataStore.');
        }
    }

    _save() {
        try {
            if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
            fs.writeFileSync(SOCIAL_FILE, JSON.stringify(this.state, null, 2), 'utf8');
        } catch {}
        if (bloxCloud.isEnabled()) {
            bloxCloud.setJson('minddrop', 'social', this.state);
        }
    }

    isOnline(userId) {
        const set = this.onlineSockets.get(userId);
        return Boolean(set && set.size > 0);
    }

    _pushToUser(userId, payload) {
        const set = this.onlineSockets.get(userId);
        if (!set) return false;
        const str = JSON.stringify(payload);
        let sent = false;
        for (const ws of set) {
            if (ws.readyState === 1) {
                try { ws.send(str); sent = true; } catch {}
            }
        }
        return sent;
    }

    registerSocket(user, ws) {
        if (!user || !user.id) { ws.close(); return; }
        let set = this.onlineSockets.get(user.id);
        const wasOffline = !set || set.size === 0;
        if (!set) { set = new Set(); this.onlineSockets.set(user.id, set); }
        set.add(ws);

        if (wasOffline) this._notifyFriendsPresence(user.id, true);

        ws.on('close', () => {
            const s = this.onlineSockets.get(user.id);
            if (s) {
                s.delete(ws);
                if (s.size === 0) {
                    this.onlineSockets.delete(user.id);
                    this._notifyFriendsPresence(user.id, false);
                }
            }
        });
    }

    _notifyFriendsPresence(userId, online) {
        const list = this.state.friends[userId] || [];
        for (const fid of list) {
            this._pushToUser(fid, { type: 'PRESENCE_UPDATE', userId, online });
        }
    }

    getSocialState(userId) {
        const friendIds = this.state.friends[userId] || [];
        const friends = friendIds
            .map(fid => {
                const u = authStore.findById(fid);
                if (!u) return null;
                const prof = eloStore.getProfile(fid, u.username, true);
                return {
                    id: u.id,
                    username: u.username,
                    elo: prof.elo,
                    level: prof.levelInfo ? prof.levelInfo.level : 1,
                    rank: prof.rank,
                    online: this.isOnline(fid),
                };
            })
            .filter(Boolean)
            .sort((a, b) => (Number(b.online) - Number(a.online)) || (b.elo - a.elo));

        const incoming = (this.state.incoming[userId] || []).map(req => ({
            fromId: req.fromId,
            fromUsername: req.fromUsername,
            createdAt: req.createdAt,
        }));

        return { friends, incoming };
    }

    sendRequest(fromUser, targetUsername) {
        const target = authStore.findByUsername(targetUsername);
        if (!target) return { error: `No account found with username "${targetUsername}".` };
        if (target.id === fromUser.id) return { error: 'You cannot add yourself as a friend.' };

        const myFriends = this.state.friends[fromUser.id] || [];
        if (myFriends.includes(target.id)) return { error: `${target.username} is already your friend.` };

        // If target already sent us a request, auto-accept!
        const myIncoming = this.state.incoming[fromUser.id] || [];
        if (myIncoming.some(r => r.fromId === target.id)) {
            return this.respondRequest(fromUser, target.id, true);
        }

        if (!this.state.incoming[target.id]) this.state.incoming[target.id] = [];
        if (this.state.incoming[target.id].some(r => r.fromId === fromUser.id)) {
            return { error: `Friend request already sent to ${target.username}.` };
        }

        const reqObj = { fromId: fromUser.id, fromUsername: fromUser.username, createdAt: Date.now() };
        this.state.incoming[target.id].push(reqObj);
        this._save();

        this._pushToUser(target.id, { type: 'FRIEND_REQUEST', request: reqObj });
        return { success: true, message: `Friend request sent to ${target.username}!` };
    }

    respondRequest(meUser, fromId, accept) {
        const list = this.state.incoming[meUser.id] || [];
        const idx = list.findIndex(r => r.fromId === fromId);
        if (idx === -1) return { error: 'Friend request not found.' };
        const req = list.splice(idx, 1)[0];
        this.state.incoming[meUser.id] = list;

        if (accept) {
            if (!this.state.friends[meUser.id]) this.state.friends[meUser.id] = [];
            if (!this.state.friends[fromId]) this.state.friends[fromId] = [];
            if (!this.state.friends[meUser.id].includes(fromId)) this.state.friends[meUser.id].push(fromId);
            if (!this.state.friends[fromId].includes(meUser.id)) this.state.friends[fromId].push(meUser.id);
            this._pushToUser(fromId, { type: 'FRIEND_ACCEPTED', byUsername: meUser.username, byId: meUser.id });
        }
        this._save();
        return { success: true, accepted: Boolean(accept), username: req.fromUsername };
    }

    removeFriend(meId, friendId) {
        if (this.state.friends[meId]) {
            this.state.friends[meId] = this.state.friends[meId].filter(id => id !== friendId);
        }
        if (this.state.friends[friendId]) {
            this.state.friends[friendId] = this.state.friends[friendId].filter(id => id !== meId);
        }
        this._save();
        return { success: true };
    }

    sendInvite(fromUser, toUserId, game, roomCode) {
        const myFriends = this.state.friends[fromUser.id] || [];
        if (!myFriends.includes(toUserId)) {
            return { error: 'You can only invite players on your friends list.' };
        }
        const cleanGame = ['pass', 'quickdraw', 'bounty'].includes(game) ? game : 'duel';
        const cleanCode = String(roomCode || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
        if (cleanCode.length !== 4) return { error: 'Invalid room code.' };

        const labelMap = {
            duel: 'High-Noon Showdown',
            pass: 'Dynamite Pass',
            quickdraw: 'Quick-Draw Trivia',
            bounty: 'Bounty Hunt',
        };
        const delivered = this._pushToUser(toUserId, {
            type: 'GAME_INVITE',
            fromId: fromUser.id,
            fromUsername: fromUser.username,
            game: cleanGame,
            gameLabel: labelMap[cleanGame] || 'High-Noon Showdown',
            roomCode: cleanCode,
            sentAt: Date.now(),
        });

        if (!delivered) {
            return { error: 'Your friend appears to be offline right now.' };
        }
        return { success: true, roomCode: cleanCode };
    }
}

module.exports = new SocialStore();
