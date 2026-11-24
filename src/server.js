/**
 * MindDrop 1v1 Rarity Combat Server (Powered by BloxCloud)
 */

const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const engine = require('./gameEngine');
const eloStore = require('./eloStore');
const authStore = require('./authStore');
const bloxCloud = require('./bloxCloudClient');

const app = express();
const port = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());

// Allow X (Twitter) Player Card iframe embedding on /embed
app.get('/embed', (req, res) => {
    res.removeHeader('X-Frame-Options');
    res.setHeader(
        'Content-Security-Policy',
        "frame-ancestors 'self' https://x.com https://twitter.com https://mobile.twitter.com https://*.twitter.com https://*.x.com https://tweetdeck.twitter.com"
    );
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use(express.static(path.join(__dirname, '../public')));

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        game: 'MindDrop 1v1 Combat',
        poweredBy: 'BloxCloud',
        bloxCloudConnected: bloxCloud.isEnabled(),
        uptime: Math.floor(process.uptime()),
    });
});

app.post('/api/auth/register', (req, res) => {
    const { username, password, guestPid } = req.body || {};
    const out = authStore.register(username, password);
    if (out.error) return res.status(400).json({ error: out.error });
    const profile = eloStore.migrateGuestToAccount(guestPid || '', out.user.id, out.user.username);
    res.json({ token: out.token, user: out.user, profile });
});

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body || {};
    const out = authStore.login(username, password);
    if (out.error) return res.status(401).json({ error: out.error });
    const profile = eloStore.getProfile(out.user.id, out.user.username, true);
    res.json({ token: out.token, user: out.user, profile });
});

app.get('/api/auth/me', (req, res) => {
    const auth = String(req.headers.authorization || '');
    const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
    const user = authStore.verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not signed in' });
    const profile = eloStore.getProfile(user.id, user.username, true);
    res.json({ user, profile });
});

app.get('/api/profile/:pid', (req, res) => {
    const profile = eloStore.getProfile(req.params.pid, req.query.name || '', false);
    res.json(profile);
});

app.get('/api/leaderboard', (req, res) => {
    res.json({ players: eloStore.getLeaderboard(15) });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Keep-alive ping so cloud reverse proxies (Render) never drop waiting 1v1 sockets
const pingInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false) return ws.terminate();
        ws.isAlive = false;
        try { ws.ping(); } catch {}
    });
}, 25000);
wss.on('close', () => clearInterval(pingInterval));

wss.on('connection', (ws, req) => {
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });
    try {
        const url = new URL(req.url, 'http://localhost');
        const token = url.searchParams.get('token') || '';
        const authedUser = authStore.verifyToken(token);

        const seenRaw = url.searchParams.get('seen') || '';
        const seenIds = seenRaw ? seenRaw.split(',').map(s => s.trim()).filter(Boolean).slice(0, 60) : [];

        engine.joinOrCreateDuel({
            mode: url.searchParams.get('mode') || 'quick',
            code: url.searchParams.get('code') || '',
            name: authedUser ? authedUser.username : (url.searchParams.get('name') || ''),
            profileId: authedUser ? authedUser.id : (url.searchParams.get('pid') || ''),
            isAccount: Boolean(authedUser),
            seenIds,
            ws,
        });
    } catch {
        ws.close();
    }
});

Promise.all([authStore.initCloud(), eloStore.initCloud()])
    .catch(() => {})
    .finally(() => {
        server.listen(port, '0.0.0.0', () => {
            const mode = bloxCloud.isEnabled() ? 'BloxCloud Cloud DataStore + Telemetry' : 'Local Mode (set BLOXCLOUD_API_KEY to connect)';
            console.log(`[MindDrop] 1v1 Rarity Combat Arena running on http://0.0.0.0:${port} (${mode})`);

            // Built-in 24/7 keep-alive pulse on Render so MindDrop never spins down after 15m idle
            if (process.env.RENDER) {
                const selfUrl = process.env.RENDER_EXTERNAL_URL
                    ? `${process.env.RENDER_EXTERNAL_URL}/api/health`
                    : 'https://minddrop-combat.onrender.com/api/health';
                setInterval(() => {
                    fetch(selfUrl).catch(() => {});
                }, 5 * 60 * 1000).unref();
            }
        });
    });
