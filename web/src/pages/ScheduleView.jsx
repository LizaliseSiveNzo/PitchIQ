import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell.jsx';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from '../context/AuthContext.jsx';

const DEMO = [
  { id: 1, type: 'Match', title: 'vs Rivera FC', when: new Date(Date.now()+2*86400000).toISOString(), where: 'Home' },
  { id: 2, type: 'Practice', title: 'Fitness + set pieces', when: new Date(Date.now()+1*86400000).toISOString(), where: 'Main Pitch' },
];

export default function ScheduleView() {
  const { role, session } = useAuth();
  const [items, setItems] = useState(session?.demo ? DEMO : []);
  const [teamName, setTeamName] = useState(session?.demo ? 'U15' : '');

  useEffect(() => { if (session?.demo) return; (async () => {
    const { data: teams } = await supabase.from('teams').select('id,name');
    setTeamName(teams?.[0]?.name || '');
    const nowIso = new Date().toISOString();
    const [{ data: matches }, { data: practices }] = await Promise.all([
      supabase.from('matches').select('id,opponent,date,venue').gte('date', nowIso),
      supabase.from('training_sessions').select('id,starts_at,location,notes').not('starts_at', 'is', null).gte('starts_at', nowIso),
    ]);
    const merged = [
      ...(matches || []).map((m) => ({ id: 'm' + m.id, type: 'Match', title: `vs ${m.opponent}`, when: m.date, where: m.venue })),
      ...(practices || []).map((p) => ({ id: 'p' + p.id, type: 'Practice', title: p.notes || 'Training', when: p.starts_at, where: p.location })),
    ].sort((a, b) => new Date(a.when) - new Date(b.when));
    setItems(merged);
  })(); }, []);

  return (
    <AppShell role={role} active="Schedule" title="Schedule">
      <div className="container" style={{ maxWidth: 680, padding: 0 }}>
        <div className="section-header"><h4 style={{ margin: 0 }}>Upcoming {teamName && `— ${teamName}`}</h4></div>
        {items.length === 0 ? <div className="card"><p className="subtle" style={{ margin: 0 }}>Nothing scheduled yet.</p></div> : (
          <div className="stack" style={{ gap: 10 }}>
            {items.map((it) => (
              <div key={it.id} className="card row between">
                <div><strong>{it.title}</strong>
                  <div className="subtle" style={{ fontSize: 13 }}>{new Date(it.when).toLocaleString()}{it.where ? ` · ${it.where}` : ''}</div></div>
                <span className={`badge ${it.type === 'Match' ? 'badge-info' : 'badge-success'}`}>{it.type}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
