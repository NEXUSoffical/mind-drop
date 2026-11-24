/**
 * MindDrop Persistent ELO Rating Store
 * Standard chess-style ELO (K=32) for both Online 1v1 and ELO-scaled AI duels.
 */

const fs = require('fs');
const path = require('path');
const bloxCloud = require('./bloxCloudClient');

const DATA_DIR = path.join(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'ratings.json');
const BASE_ELO = 0;
const MIN_ELO = 0;
const K_FACTOR = 32;

class EloStore {
    constructor() {
        this.ratings = {};
        this._load();
    }

    _load() {
        try {
            if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
            if (fs.existsSync(DATA_FILE)) {
                const raw = fs.readFileSync(DATA_FILE, 'utf8');
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') this.ratings = parsed;
            }
        } catch {
            this.ratings = {};
        }
    }

    async initCloud() {
        if (!bloxCloud.isEnabled()) return;
        const remote = await bloxCloud.getJson('minddrop', 'ratings');
        if (remote && typeof remote === 'object') {
            this.ratings = { ...this.ratings, ...remote };
            console.log(`[MindDrop ELO] Hydrated ${Object.keys(remote).length} ranked accounts from BloxCloud Cloud DataStore.`);
        }
    }

    _save() {
        const persisted = {};
        for (const [k, v] of Object.entries(this.ratings)) {
            if (v && v.isAccount) persisted[k] = v;
        }
        try {
            if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
            fs.writeFileSync(DATA_FILE, JSON.stringify(persisted, null, 2), 'utf8');
        } catch {}
        if (bloxCloud.isEnabled()) {
            bloxCloud.setJson('minddrop', 'ratings', persisted);
        }
    }

    _cleanKey(key) {
        return String(key || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'guest';
    }

    getRankForElo(elo) {
        if (elo >= 900) return { name: 'GRANDMASTER', color: '#fde047' };
        if (elo >= 600) return { name: 'PLATINUM', color: '#c084fc' };
        if (elo >= 350) return { name: 'GOLD', color: '#fbbf24' };
        if (elo >= 150) return { name: 'SILVER', color: '#38bdf8' };
        return { name: 'BRONZE', color: '#fb923c' };
    }

    getAiTierForElo(playerElo) {
        if (playerElo >= 600) {
            return { label: 'GRANDMASTER', skill: 'grandmaster', minDelayMs: 1800, maxDelayMs: 4000 };
        }
        if (playerElo >= 350) {
            return { label: 'HARD', skill: 'hard', minDelayMs: 2200, maxDelayMs: 4800 };
        }
        if (playerElo >= 150) {
            return { label: 'MEDIUM', skill: 'medium', minDelayMs: 2600, maxDelayMs: 5800 };
        }
        return { label: 'EASY', skill: 'easy', minDelayMs: 3200, maxDelayMs: 6800 };
    }

    getProfile(rawKey, displayName, isAccount = false) {
        const key = this._cleanKey(rawKey);
        if (!this.ratings[key]) {
            this.ratings[key] = {
                key,
                name: displayName || 'Fighter',
                isAccount: Boolean(isAccount),
                elo: BASE_ELO,
                wins: 0,
                losses: 0,
                draws: 0,
            };
        } else {
            if (displayName) this.ratings[key].name = displayName;
            if (isAccount) this.ratings[key].isAccount = true;
        }
        const rec = this.ratings[key];
        return {
            ...rec,
            rank: this.getRankForElo(rec.elo),
            nextAiTier: this.getAiTierForElo(rec.elo).label,
        };
    }

    calculateEloDelta(myElo, oppElo, score) {
        const expected = 1 / (1 + Math.pow(10, (oppElo - myElo) / 400));
        let delta = Math.round(K_FACTOR * (score - expected));
        if (score === 1 && delta < 5) delta = 5;
        if (score === 0 && delta > -5) delta = -5;
        return delta;
    }

    recordMatch(rawKey, displayName, oppElo, result, isAccount = false) {
        const key = this._cleanKey(rawKey);
        const profile = this.getProfile(key, displayName, isAccount);
        const oldElo = profile.elo;
        const score = result === 'WIN' ? 1 : (result === 'LOSS' ? 0 : 0.5);
        const delta = this.calculateEloDelta(oldElo, oppElo, score);
        const newElo = Math.max(MIN_ELO, oldElo + delta);
        const actualDelta = newElo - oldElo;

        this.ratings[key].elo = newElo;
        this.ratings[key].isAccount = Boolean(isAccount || this.ratings[key].isAccount);
        if (result === 'WIN') this.ratings[key].wins++;
        else if (result === 'LOSS') this.ratings[key].losses++;
        else this.ratings[key].draws++;

        // Only permanently persist signed-in accounts to disk
        if (this.ratings[key].isAccount) this._save();

        return {
            oldElo,
            newElo,
            delta: actualDelta,
            isAccount: this.ratings[key].isAccount,
            rank: this.getRankForElo(newElo),
            nextAiTier: this.getAiTierForElo(newElo).label,
            wins: this.ratings[key].wins,
            losses: this.ratings[key].losses,
            draws: this.ratings[key].draws,
        };
    }

    migrateGuestToAccount(rawGuestKey, rawAccountKey, username) {
        const guestKey = this._cleanKey(rawGuestKey);
        const accKey = this._cleanKey(rawAccountKey);
        const guest = this.ratings[guestKey];
        const existing = this.ratings[accKey];

        if (guest && !guest.isAccount && (!existing || (existing.wins + existing.losses + existing.draws) === 0)) {
            this.ratings[accKey] = {
                key: accKey,
                name: username,
                isAccount: true,
                elo: guest.elo,
                wins: guest.wins,
                losses: guest.losses,
                draws: guest.draws,
            };
            delete this.ratings[guestKey];
            this._save();
        } else {
            this.getProfile(accKey, username, true);
            this._save();
        }
        return this.getProfile(accKey, username, true);
    }

    getLeaderboard(limit = 100, myKey = null) {
        const ranked = Object.values(this.ratings)
            .filter(r => r.isAccount && (r.wins + r.losses + r.draws) > 0)
            .sort((a, b) => (b.elo - a.elo) || (b.wins - a.wins))
            .map((r, idx) => ({
                position: idx + 1,
                key: r.key,
                name: r.name || 'Fighter',
                elo: r.elo,
                wins: r.wins,
                losses: r.losses,
                draws: r.draws,
                rank: this.getRankForElo(r.elo),
            }));

        const cleanMyKey = myKey ? this._cleanKey(myKey) : null;
        const me = cleanMyKey ? (ranked.find(r => r.key === cleanMyKey) || null) : null;

        return {
            players: ranked.slice(0, limit),
            totalRanked: ranked.length,
            me,
        };
    }
}

module.exports = new EloStore();
