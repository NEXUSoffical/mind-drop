/**
 * BloxCloud Cloud DataStore Client for MindDrop
 * Persists player accounts, ELO ratings, and Global Leaderboard directly in
 * BloxCloud's PostgreSQL Cloud DataStore API (https://bloxcloud.world).
 */

class BloxCloudClient {
    constructor() {
        this._writeChains = new Map();
    }

    get apiKey() {
        return (process.env.BLOXCLOUD_API_KEY || '').trim();
    }

    get baseUrl() {
        return (process.env.BLOXCLOUD_URL || 'https://bloxcloud.world').replace(/\/$/, '');
    }

    isEnabled() {
        return Boolean(this.apiKey);
    }

    async getJson(store, key) {
        if (!this.isEnabled()) return null;
        try {
            const res = await fetch(`${this.baseUrl}/api/v1/datastore/${encodeURIComponent(store)}/${encodeURIComponent(key)}`, {
                method: 'GET',
                headers: { 'x-api-key': this.apiKey },
            });
            if (!res.ok) return null;
            const data = await res.json();
            return data && data.found ? data.value : null;
        } catch (err) {
            console.warn(`[BloxCloud] Failed to read ${store}/${key}:`, err.message);
            return null;
        }
    }

    setJson(store, key, value) {
        if (!this.isEnabled()) return Promise.resolve(false);
        const chainKey = `${store}:${key}`;
        const prev = this._writeChains.get(chainKey) || Promise.resolve();
        const next = prev.then(async () => {
            try {
                const res = await fetch(`${this.baseUrl}/api/v1/datastore/${encodeURIComponent(store)}/${encodeURIComponent(key)}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': this.apiKey,
                    },
                    body: JSON.stringify({ value }),
                });
                return res.ok;
            } catch (err) {
                console.warn(`[BloxCloud] Failed to write ${store}/${key}:`, err.message);
                return false;
            }
        });
        this._writeChains.set(chainKey, next);
        return next;
    }

    async recordMatchFormed(queueType, players) {
        if (!this.isEnabled() || !Array.isArray(players) || players.length < 2) return false;
        try {
            const res = await fetch(`${this.baseUrl}/api/v1/matchmaking/record`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                },
                body: JSON.stringify({
                    queueType,
                    players: players.map(p => ({
                        userId: p.profileKey || p.id,
                        username: p.name,
                        rating: p.elo ?? 0,
                    })),
                }),
            });
            return res.ok;
        } catch (err) {
            console.warn('[BloxCloud] Failed to record formed match:', err.message);
            return false;
        }
    }
}

module.exports = new BloxCloudClient();
