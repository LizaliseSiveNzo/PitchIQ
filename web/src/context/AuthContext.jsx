import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// Demo profiles so the app can be explored without a real account.
export const DEMO_USERS = {
  admin:  { id: 'demo-admin',  name: 'Lizalise Nzo',   role: 'admin',  org: 'Tux Academy' },
  coach:  { id: 'demo-coach',  name: 'Coach Dlamini',  role: 'coach',  org: 'Tux Academy' },
  parent: { id: 'demo-parent', name: 'Mrs. Mokoena',   role: 'parent', org: 'Tux Academy' },
  player: { id: 'demo-player', name: 'Thabo Mokoena',  role: 'player', org: 'Tux Academy' },
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user || session.demo) return;   // demo sessions skip DB lookup
    supabase.from('users').select('*').eq('id', session.user.id).single()
      .then(({ data }) => { if (data) setProfile(data); });
  }, [session]);

  // ---- Real Supabase auth ----
  async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    const { data: prof } = await supabase.from('users').select('*').eq('id', data.user.id).single();
    setProfile(prof);
    return { role: prof?.role };
  }

  async function signUp({ name, email, password, role, childCode }) {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name, role } },   // read by the handle_new_user trigger
    });
    if (error) return { error: error.message };
    // If a session exists (email confirmation disabled), a parent can link their child now.
    if (role === 'parent' && childCode && data.session) {
      await supabase.rpc('link_child', { code: childCode });
    }
    return { needsConfirmation: !data.session, role };
  }

  // ---- Demo / master ----
  function demoLogin(role) {
    setProfile(DEMO_USERS[role]);
    setSession({ user: { id: DEMO_USERS[role].id }, demo: true });
  }

  function logout() {
    setSession(null);
    setProfile(null);
    supabase.auth.signOut().catch(() => {});
  }

  return (
    <AuthContext.Provider value={{
      session, profile, role: profile?.role, loading,
      signIn, signUp, demoLogin, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
