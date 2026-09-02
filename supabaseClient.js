// Creates one shared Supabase client for the whole app.
// Depends on config.js being loaded first (defines SUPABASE_URL / SUPABASE_ANON_KEY)
// and the Supabase CDN script being loaded before this file (defines window.supabase).
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
