import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;

// Service-role client — bypasses RLS. Use ONLY on the server for admin tasks.
export const supabaseAdmin = createClient(
  url,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Anon client — respects RLS. Attach a user's JWT to act as that user.
export function supabaseAsUser(accessToken) {
  return createClient(url, process.env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
