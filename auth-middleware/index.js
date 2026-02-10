import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(helmet());
app.use(express.json({ limit: '10kb' }));

// Enable CORS for frontend requests (Required for integration)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Rate limiter for auth endpoints
const authLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20,
    standardHeaders: true,
    legacyHeaders: false
});

app.use('/check-password', authLimiter);
app.use('/verify-captcha', authLimiter);

// ----- Utilities -----
function passwordStrength(password) {
    const lengthScore = Math.min(Math.floor(password.length / 2), 4); // 0..4
    const lower = /[a-z]/.test(password);
    const upper = /[A-Z]/.test(password);
    const digit = /[0-9]/.test(password);
    const symbol = /[^A-Za-z0-9]/.test(password);
    const variety = [lower, upper, digit, symbol].filter(Boolean).length;
    const varietyScore = Math.min(variety, 4); // 0..4
    const score = lengthScore + varietyScore; // 0..8
    return { score, length: password.length, variety };
}

async function hibpPwnedCount(password) {
    // SHA-1 + k-anonymity
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    const prefix = hashHex.slice(0, 5);
    const suffix = hashHex.slice(5);
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
        headers: { 'Add-Padding': 'true' }
    });
    if (!res.ok) throw new Error(`HIBP responded ${res.status}`);
    const text = await res.text();
    const lines = text.split('\n');
    for (const line of lines) {
        const parts = line.trim().split(':');
        if (parts[0] === suffix) {
            return parseInt(parts[1].trim(), 10);
        }
    }
    return 0;
}

// ----- Endpoints -----
app.post('/check-password', async (req, res) => {
    try {
        const { password } = req.body ?? {};
        if (!password || typeof password !== 'string') {
            return res.status(400).json({ ok: false, reason: 'missing_password' });
        }

        if (password.length < 8) {
            return res.status(200).json({ ok: false, compromised: false, pwnedCount: 0, strengthScore: 0, reason: 'too_short' });
        }

        const strength = passwordStrength(password);

        let pwnedCount = 0;
        try {
            pwnedCount = await hibpPwnedCount(password);
        } catch (err) {
            console.error('HIBP error:', err?.message ?? err);
            // Allow signup but warn — do not block on HIBP failure
        }

        const compromised = pwnedCount > 0;
        const minimumScore = Number(process.env.MIN_STRENGTH_SCORE ?? 4);
        const strengthOk = strength.score >= minimumScore;
        const ok = !compromised && strengthOk;

        return res.status(200).json({
            ok,
            compromised,
            pwnedCount,
            strengthScore: strength.score,
            strengthDetails: strength,
            reason: ok ? undefined : (compromised ? 'password_compromised' : 'weak_password')
        });
    } catch (err) {
        console.error('check-password error:', err);
        return res.status(500).json({ ok: false, reason: 'server_error' });
    }
});

app.post('/verify-captcha', async (req, res) => {
    try {
        const token = req.body?.token;
        if (!token) return res.status(400).json({ ok: false, reason: 'missing_token' });
        const secret = process.env.TURNSTILE_SECRET;
        if (!secret) return res.status(500).json({ ok: false, reason: 'missing_turnstile_secret' });

        const params = new URLSearchParams();
        params.append('secret', secret);
        params.append('response', token);

        const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            body: params
        });
        const data = await r.json();
        return res.status(200).json({ ok: !!data.success, details: data });
    } catch (err) {
        console.error('verify-captcha error:', err);
        return res.status(500).json({ ok: false, reason: 'captcha_verification_failed' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Auth hardening middleware listening on port ${PORT}`);
});
