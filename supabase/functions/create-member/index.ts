import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret',
}

serve(async (req: Request) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. Verify Secret Header
        // Ideally, this secret comes from an Environment Variable, but we'll check against a passed header for now as requested.
        // In a real scenario, you might compare this to Deno.env.get('ADMIN_SECRET')
        const adminSecret = req.headers.get('x-admin-secret')
        const configuredSecret = Deno.env.get('ADMIN_SECRET') || 'default-secret-change-me'

        if (adminSecret !== configuredSecret) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized: Invalid Admin Secret' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // 2. Parse Payload
        const payload = await req.json()
        const { name, type, role, phone, birth_date, status, avatar, user_id } = payload

        // 3. Validate Payload
        if (!name || name.trim().length < 2) {
            return new Response(
                JSON.stringify({ error: 'Validation Error: Name is required (min 2 chars)' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        if (!['staff', 'kid', 'volunteer', 'child', 'membro'].includes(type)) {
            return new Response(
                JSON.stringify({ error: 'Validation Error: Invalid type' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // 4. Initialize Supabase Admin Client (Service Role)
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseServiceKey = Deno.env.get('ADTAG_SERVICE_ROLE_KEY') ?? ''

        if (!supabaseServiceKey) {
            throw new Error('Missing ADTAG_SERVICE_ROLE_KEY')
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

        // 5. Insert Data
        const { data, error } = await supabaseAdmin
            .from('team_members')
            .insert([
                {
                    name,
                    type,
                    role,
                    phone,
                    birth_date,
                    status: status || 'Ativo',
                    avatar,
                    user_id,
                    created_at: new Date().toISOString()
                }
            ])
            .select()
            .single()

        if (error) throw error

        return new Response(
            JSON.stringify(data),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 }
        )

    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
    }
})
