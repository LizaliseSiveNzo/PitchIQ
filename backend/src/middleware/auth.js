import { supabaseAdmin } from '../config/supabase.js';

// Verifies the Supabase JWT from the Authorization header and loads the app user.
export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing bearer token' });

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ error: 'Invalid or expired token' });

    const { data: profile } = await supabaseAdmin
      .from('users').select('*').eq('id', data.user.id).single();

    req.token = token;
    req.user = profile || { id: data.user.id, email: data.user.email };
    next();
  } catch (err) {
    next(err);
  }
}
