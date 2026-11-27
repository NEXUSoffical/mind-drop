/**
 * MindDrop Optional Account Auth Store
 * Guests can always play without signing in; players who want to permanently
 * save their ELO across devices and rank on the leaderboard can register/login.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bloxCloud = require('./bloxCloudClient');

const DATA_DIR = path.join(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SECRET_FILE = path.join(DATA_DIR, '.auth_secret');

class AuthStore {
    constructor() {
        this.users = {}; // lowercase username -> { id, username, salt, hash, createdAt }
        this.secret = this._loadOrCreateSecret();
        this._load();
    }

    _loadOrCreateSecret() {
        if (process.env.MINDDROP_AUTH_SECRET) return process.env.MINDDROP_AUTH_SECRET;
        try {
            if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
            if (fs.existsSync(SECRET_FILE)) {
                const s = fs.readFileSync(SECRET_FILE, 'utf8').trim();
                if (s.length >= 32) return s;
            }
            const fresh = crypto.randomBytes(32).toString('hex');
            fs.writeFileSync(SECRET_FILE, fresh, { mode: 0o600 });
            return fresh;
        } catch {
            return crypto.randomBytes(32).toString('hex');
        }
    }

    _load() {
        try {
            if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
            if (fs.existsSync(USERS_FILE)) {
                const parsed = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
                if (parsed && typeof parsed === 'object') this.users = parsed;
            }
        } catch {
            this.users = {};
        }
    }

    async initCloud() {
        if (!bloxCloud.isEnabled()) return;
        const remote = await bloxCloud.getJson('minddrop', 'users');
        if (remote && typeof remote === 'object') {
            this.users = { ...this.users, ...remote };
            console.log(`[MindDrop Auth] Hydrated ${Object.keys(remote).length} player accounts from BloxCloud Cloud DataStore.`);
        }
    }

    _save() {
        try {
            if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
            fs.writeFileSync(USERS_FILE, JSON.stringify(this.users, null, 2), 'utf8');
        } catch {}
        if (bloxCloud.isEnabled()) {
            bloxCloud.setJson('minddrop', 'users', this.users);
        }
    }

    _signToken(user) {
        const payload = Buffer.from(JSON.stringify({
            id: user.id,
            username: user.username,
            iat: Date.now(),
        })).toString('base64url');
        const sig = crypto.createHmac('sha256', this.secret).update(payload).digest('base64url');
        return `${payload}.${sig}`;
    }

    verifyToken(token) {
        if (!token || typeof token !== 'string' || !token.includes('.')) return null;
        const [payload, sig] = token.split('.');
        if (!payload || !sig) return null;
        const expected = crypto.createHmac('sha256', this.secret).update(payload).digest('base64url');
        const a = Buffer.from(sig);
        const b = Buffer.from(expected);
        if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
        try {
            const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
            const rec = this.users[String(data.username || '').toLowerCase()];
            if (!rec || rec.id !== data.id) return null;
            return { id: rec.id, username: rec.username };
        } catch {
            return null;
        }
    }

    register(rawUsername, rawPassword) {
        const username = String(rawUsername || '').trim();
        const password = String(rawPassword || '');
        if (!/^[a-zA-Z0-9_-]{3,16}$/.test(username)) {
            return { error: 'Username must be 3-16 characters (letters, numbers, _ or -).' };
        }
        if (password.length < 6 || password.length > 72) {
            return { error: 'Password must be at least 6 characters.' };
        }
        const key = username.toLowerCase();
        if (this.users[key]) {
            return { error: 'That username is already taken.' };
        }

        const id = 'u_' + crypto.randomBytes(6).toString('hex');
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.scryptSync(password, salt, 64).toString('hex');

        this.users[key] = {
            id,
            username,
            salt,
            hash,
            createdAt: Date.now(),
        };
        this._save();

        const user = { id, username };
        return { token: this._signToken(user), user };
    }

    login(rawUsername, rawPassword) {
        const username = String(rawUsername || '').trim();
        const password = String(rawPassword || '');
        const rec = this.users[username.toLowerCase()];
        if (!rec) return { error: 'Invalid username or password.' };

        const derived = crypto.scryptSync(password, rec.salt, 64);
        const stored = Buffer.from(rec.hash, 'hex');
        if (derived.length !== stored.length || !crypto.timingSafeEqual(derived, stored)) {
            return { error: 'Invalid username or password.' };
        }

        const user = { id: rec.id, username: rec.username };
        return { token: this._signToken(user), user };
    }

    findByUsername(rawUsername) {
        const rec = this.users[String(rawUsername || '').trim().toLowerCase()];
        return rec ? { id: rec.id, username: rec.username } : null;
    }

    findById(id) {
        for (const rec of Object.values(this.users)) {
            if (rec && rec.id === id) return { id: rec.id, username: rec.username };
        }
        return null;
    }
}

module.exports = new AuthStore();
