// Auth controller — Supabase Auth + role-based onboarding.
// TODO: implement against Supabase Auth (see Blueprint Prompt 2).
export async function register(_req, res)   { res.status(501).json({ todo: 'register with role selection' }); }
export async function login(_req, res)      { res.status(501).json({ todo: 'login -> supabase session + JWT' }); }
export async function inviteCoach(_req, res){ res.status(501).json({ todo: 'admin invites coach via email link' }); }
export async function linkChild(_req, res)  { res.status(501).json({ todo: 'parent links child via unique child_code' }); }
