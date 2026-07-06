import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell.jsx';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from '../context/AuthContext.jsx';

const DEMO = [
  { id: 1, title: 'Practice moved to 17:00 on Thursday', body: 'Main pitch is being re-lined. Same place, one hour later.', created_at: new Date(Date.now() - 3600e3).toISOString() },
  { id: 2, title: 'Bring water bottles + shin pads', body: null, created_at: new Date(Date.now() - 2 * 86400e3).toISOString() },
];

export default function Announcements() {
  const { role, session } = useAuth();
  const [items, setItems] = useState(session?.demo ? DEMO : []);
  const [loading, setLoading] = useState(!session?.demo);

  useEffect(() => { if (session?.demo) return; (async () => {
    const { data } = await supabase.from('announcements')
      .select('id,title,body,created_at')
      .order('created_at', { ascending: false }).limit(30);
    setItems(data || []); setLoading(false);
  })(); }, []);

  return (
    <AppShell role={role} active="Announcements" title="Announcements">
      <div className="container" style={{ maxWidth: 680, padding: 0 }}>
        {loading ? <div className="card">Loading…</div> :
         items.length === 0 ? <div className="card"><p className="subtle" style={{ margin: 0 }}>No announcements from your coach yet.</p></div> : (
          <div className="stack" style={{ gap: 12 }}>
            {items.map((a) => (
              <div key={a.id} className="card">
                <strong>📣 {a.title}</strong>
                {a.body && <p style={{ margin: '6px 0 0' }}>{a.body}</p>}
                <div className="subtle" style={{ fontSize: 12, marginTop: 6 }}>{new Date(a.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
