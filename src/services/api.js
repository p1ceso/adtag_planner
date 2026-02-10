import { supabase } from '../lib/supabase';

/**
 * Converts a buffer to a hex string
 * @param {ArrayBuffer} buffer 
 * @returns {string}
 */
function bufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Inserts a team member using the secure Edge Function
 * @param {Object} memberData - The member data to insert
 * @returns {Promise<any>} - The inserted member data
 */
export async function insertTeamMember(memberData) {
    // Note: In a real production app, storing secrets in frontend env is risky.
    // Ideally this signature generation happens on a server or we use an auth token.
    // For this internal tool, we assume VITE_ADMIN_SECRET is available.
    const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET;

    if (!ADMIN_SECRET) {
        console.error('VITE_ADMIN_SECRET is missing. Requests will likely fail verification.');
        // We might still try, or throw code depending on preference.
        throw new Error('Configuration error: Missing ADMIN_SECRET');
    }

    // specific field filtering could happen here, but we'll send what is passed
    // and rely on backend validation.

    // We MUST stringify manually to ensure the signature matches the body sent
    const bodyStr = JSON.stringify(memberData);

    // Create HMAC SHA-256 signature
    const enc = new TextEncoder();
    const keyData = enc.encode(ADMIN_SECRET);
    const msgData = enc.encode(bodyStr);

    const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, msgData);
    const hexSignature = bufferToHex(signature);

    const { data, error } = await supabase.functions.invoke('insert-team-member', {
        body: bodyStr,
        headers: {
            'x-admin-signature': hexSignature,
            'Content-Type': 'application/json'
        }
    });

    if (error) {
        // Parse error message if possible
        let errorMsg = error.message;
        try {
            // Supabase invoke error body might be a stream or text
            if (error.context && error.context.json) {
                const errBody = await error.context.json();
                if (errBody.error) errorMsg = errBody.error;
            }
        } catch (e) { /* ignore */ }
        throw new Error(errorMsg || 'Failed to insert team member');
    }

    return data;
}
