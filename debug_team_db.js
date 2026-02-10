
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; // Using Anon Key, so simulates client

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDB() {
    console.log("Testing Team Members DB...");

    // 1. Check if we can select (even if empty)
    const { data: initialData, error: selectError } = await supabase.from('team_members').select('*').limit(1);
    if (selectError) {
        console.error("Select Error:", selectError);
    } else {
        console.log("Select Success. Rows:", initialData?.length);
    }

    // Note: We can't insert easily without a valid session (User Context) because of RLS.
    // 'Users can CRUD their own team' -> requires auth.uid()
    // We are running as Anon without login.

    // So we can only check if TABLE exists and is readable (likely returns 0 rows due to RLS).
    // If it returns error "relation not found", table is missing.
}

testDB();
