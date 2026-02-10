// insert-team-member/index.ts
// Edge Function to insert a team member using the service role key.
// Expectations (env):
//  - SUPABASE_URL
//  - SUPABASE_SERVICE_ROLE_KEY
//  - ADMIN_SECRET (used to verify request via HMAC signature)
// Request:
//  - POST
//  - Header: x-admin-signature: hex(HMAC_SHA256(ADMIN_SECRET, rawBody))
//    (Optionally you can keep x-admin-secret check, see comments below.)
//  - Body: JSON with allowed fields: name (required), type (required: staff|kid|volunteer),
//          role, phone, birth_date (ISO), status, avatar, user_id (optional)

Deno.serve(async (req: Request) => {
    try {
        if (req.method !== 'POST') {
            return new Response(JSON.stringify({ error: 'Method not allowed' }), {
                status: 405,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Validate env
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        const ADMIN_SECRET = Deno.env.get('ADMIN_SECRET') ?? '';

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ADMIN_SECRET) {
            console.error('Missing environment variables');
            return new Response(JSON.stringify({ error: 'Server misconfiguration' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }

        // Read raw body as ArrayBuffer for HMAC verification, and as text/JSON
        const rawBuffer = await req.arrayBuffer();
        const rawText = new TextDecoder().decode(rawBuffer);

        // Verify signature header (HMAC-SHA256 hex)
        const providedSig = req.headers.get('x-admin-signature') ?? '';
        if (!providedSig) {
            // Optional fallback: simple secret compare using x-admin-secret (less secure).
            const providedSecret = req.headers.get('x-admin-secret') ?? '';
            if (!providedSecret || providedSecret !== ADMIN_SECRET) {
                return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
            }
        } else {
            // Compute HMAC-SHA256(ADMIN_SECRET, rawText) and compare as hex
            const enc = new TextEncoder();
            const keyData = enc.encode(ADMIN_SECRET);
            const msgData = enc.encode(rawText);

            const cryptoKey = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
            const sig = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
            const sigHex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
            // Constant-time compare
            if (!constantTimeEquals(sigHex, providedSig)) {
                return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
            }
        }

        // Parse JSON safely
        let body: any;
        try {
            body = rawText ? JSON.parse(rawText) : null;
        } catch (e) {
            return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        if (!body || typeof body !== 'object') {
            return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        // Allowed values & basic validators
        const allowedTypes = ['staff', 'kid', 'volunteer'];
        const maxLen = { name: 191, role: 100, status: 50, avatar: 1000, phone: 30 };

        const {
            name,
            type,
            role = null,
            phone = null,
            birth_date = null,
            status = 'Ativo',
            avatar = null,
            user_id = null,
        } = body;

        // name
        if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > maxLen.name) {
            return new Response(JSON.stringify({ error: 'Invalid name' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        // type
        if (!type || typeof type !== 'string' || !allowedTypes.includes(type)) {
            return new Response(JSON.stringify({ error: 'Invalid type' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        // role
        if (role !== null && (typeof role !== 'string' || role.length > maxLen.role)) {
            return new Response(JSON.stringify({ error: 'Invalid role' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        // phone (optional) - basic pattern allow digits, plus, spaces, -, ()
        if (phone !== null && (typeof phone !== 'string' || phone.length > maxLen.phone || !/^[\d+\-\s()]+$/.test(phone))) {
            return new Response(JSON.stringify({ error: 'Invalid phone' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        // birth_date (optional) - must be ISO date
        if (birth_date !== null && typeof birth_date === 'string') {
            const d = Date.parse(birth_date);
            if (Number.isNaN(d)) {
                return new Response(JSON.stringify({ error: 'Invalid birth_date' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
            }
        } else if (birth_date !== null) {
            return new Response(JSON.stringify({ error: 'Invalid birth_date' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        // status
        if (status !== null && (typeof status !== 'string' || status.length > maxLen.status)) {
            return new Response(JSON.stringify({ error: 'Invalid status' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        // avatar (optional) - basic URL validation
        if (avatar !== null) {
            if (typeof avatar !== 'string' || avatar.length > maxLen.avatar) {
                return new Response(JSON.stringify({ error: 'Invalid avatar' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
            }
            try {
                const url = new URL(avatar);
                if (!['http:', 'https:'].includes(url.protocol)) {
                    return new Response(JSON.stringify({ error: 'Invalid avatar URL' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
                }
            } catch (e) {
                return new Response(JSON.stringify({ error: 'Invalid avatar URL' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
            }
        }
        // user_id (optional) - UUID validation
        if (user_id !== null && (typeof user_id !== 'string' || !isUuid(user_id))) {
            return new Response(JSON.stringify({ error: 'Invalid user_id' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        // Build sanitized insert object (whitelist)
        const insertObj: Record<string, any> = {
            name: name.trim(),
            type,
            role: role ?? null,
            phone: phone ?? null,
            birth_date: birth_date ?? null,
            status: status ?? 'Ativo',
            avatar: avatar ?? null,
            user_id: user_id ?? null,
        };

        // Call Supabase REST (PostgREST) using service_role key
        const res = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/team_members`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                apikey: SUPABASE_SERVICE_ROLE_KEY,
                Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                Prefer: 'return=representation',
            },
            body: JSON.stringify(insertObj),
        });

        const text = await res.text();
        let result: any = null;
        try {
            result = text ? JSON.parse(text) : null;
        } catch (e) {
            console.error('failed parsing response', e);
            return new Response(JSON.stringify({ error: 'Invalid response from DB' }), { status: 502, headers: { 'Content-Type': 'application/json' } });
        }

        if (!res.ok) {
            return new Response(JSON.stringify({ error: 'Insert failed', details: result }), { status: res.status, headers: { 'Content-Type': 'application/json' } });
        }

        const insertedRow = Array.isArray(result) ? result[0] : result;

        // Prepare audit payload
        const auditPayload = {
            table_name: 'team_members',
            operation: 'INSERT',
            performed_by: null, // optionally set if you derive an actor from the request
            row_before: null,
            row_after: insertedRow,
        };

        // Background audit log - use EdgeRuntime.waitUntil to ensure background completion
        const auditPromise = fetch(`${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/audit_logs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                apikey: SUPABASE_SERVICE_ROLE_KEY,
                Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify(auditPayload),
        }).then(async (r) => {
            if (!r.ok) {
                const t = await r.text().catch(() => '');
                console.error('audit log failed', r.status, t);
            }
        }).catch((e) => console.error('audit log failed', e));

        // @ts-ignore EdgeRuntime is available in Supabase Edge Functions environment
        try {
            // Use EdgeRuntime.waitUntil when available
            // If not available, the promise will still run but might be terminated on function end
            // This line is safe in Supabase environment.
            (globalThis as any).EdgeRuntime?.waitUntil?.(auditPromise);
        } catch (e) {
            // If EdgeRuntime not present, schedule but don't block
            // eslint-disable-next-line no-void
            void auditPromise;
        }

        return new Response(JSON.stringify({ success: true, data: insertedRow }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err: any) {
        console.error('internal error', err?.message ?? err);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
});

/* Helpers */

// Constant-time string comparison to mitigate timing attacks
function constantTimeEquals(a: string, b: string) {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= (a.charCodeAt(i) ^ b.charCodeAt(i));
    }
    return result === 0;
}

function isUuid(s: string) {
    // permissive uuid v4 pattern (36 chars with dashes)
    return /^[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}$/.test(s);
}