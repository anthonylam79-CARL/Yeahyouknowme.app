import { createClient } from '@supabase/supabase-js';

// Server-only client using the service role key. Never import this from
// client components — it bypasses RLS entirely, which is exactly why all
// scoring, ranking and owner-token checks happen here rather than in the
// browser.
let client = null;

export function supabaseAdmin() {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Set these in .env.local (see .env.example).'
    );
  }

  client = createClient(url, key, {
    auth: { persistSession: false },
  });
  return client;
}
