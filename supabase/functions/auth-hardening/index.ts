// Edge Function (Deno + Supabase) - index.ts
// Purpose: /check-password and /verify-captcha-like endpoints
// Assumptions: Deno runtime with global fetch and Web Crypto available.
// If using Turnstile, set TURNSTILE_SECRET in function secrets.

interface CheckPasswordRequest {
    password?: string;
}

interface ResponseBody {
    ok: boolean;
    compromised?: boolean;
    pwnedCount?: number;
    strengthScore?: number;
    strengthDetails?: { score: number; length: number; variety: number };
    reason?: string;
    details?: any;
}

const MIN_STRENGTH_SCORE = Number(Deno.env.get('MIN_STRENGTH_SCORE') ?? '4');
const TURNSTILE_SECRET = Deno.env.get('TURNSTILE_SECRET');

// CORS Headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function passwordStrength(password: string) {
    const lengthScore = Math.min(Math.floor(password.length / 2), 4);
    const lower = /[a-z]/.test(password);
    const upper = /[A-Z]/.test(password);
    const digit = /[0-9]/.test(password);
    const symbol = /[^A-Za-z0-9]/.test(password);
    const variety = [lower, upper, digit, symbol].filter(Boolean).length;
    const varietyScore = Math.min(variety, 4);
    const score = lengthScore + varietyScore;
    return { score, length: password.length, variety };
}

async function sha1Hex(input: string) {
    const enc = new TextEncoder();
    const data = enc.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

async function hibpPwnedCount(password: string) {
    const hashHex = await sha1Hex(password);
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
        if (parts[0] === suffix) return parseInt(parts[1].trim(), 10);
    }
    return 0;
}

async function handleCheckPassword(req: Request): Promise<Response> {
    try {
        const json = await req.json().catch(() => ({})) as CheckPasswordRequest;
        const password = json.password;
        if (!password || typeof password !== 'string') {
            return new Response(JSON.stringify({ ok: false, reason: 'missing_password' } as ResponseBody), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        if (password.length < 8) {
            return new Response(JSON.stringify({ ok: false, compromised: false, pwnedCount: 0, strengthScore: 0, reason: 'too_short' } as ResponseBody), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const strength = passwordStrength(password);
        let pwnedCount = 0;
        try {
            pwnedCount = await hibpPwnedCount(password);
        } catch (err) {
            console.error('HIBP error', err);
        }

        const compromised = pwnedCount > 0;
        const strengthOk = strength.score >= MIN_STRENGTH_SCORE;
        const ok = !compromised && strengthOk;

        const body: ResponseBody = {
            ok,
            compromised,
            pwnedCount,
            strengthScore: strength.score,
            strengthDetails: strength,
            reason: ok ? undefined : (compromised ? 'password_compromised' : 'weak_password')
        };
        return new Response(JSON.stringify(body), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ ok: false, reason: 'server_error' } as ResponseBody), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
}

async function handleVerifyCaptcha(req: Request): Promise<Response> {
    try {
        const json = await req.json().catch(() => ({}));
        const token = json?.token;
        if (!token) return new Response(JSON.stringify({ ok: false, reason: 'missing_token' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        if (!TURNSTILE_SECRET) return new Response(JSON.stringify({ ok: false, reason: 'missing_turnstile_secret' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

        const params = new URLSearchParams();
        params.append('secret', TURNSTILE_SECRET);
        params.append('response', token);

        const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            body: params
        });
        const data = await r.json();
        return new Response(JSON.stringify({ ok: !!data.success, details: data }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } catch (err) {
        console.error('captcha verify error', err);
        return new Response(JSON.stringify({ ok: false, reason: 'captcha_verification_failed' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
}

Deno.serve(async (req: Request) => {
    const url = new URL(req.url);

    // Handle CORS preflight options
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    if (req.method === 'POST' && url.pathname.endsWith('/check-password')) {
        return handleCheckPassword(req);
    }
    if (req.method === 'POST' && url.pathname.endsWith('/verify-captcha')) {
        return handleVerifyCaptcha(req);
    }
    return new Response(JSON.stringify({ ok: false, reason: 'not_found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});
