import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell.jsx';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from '../context/AuthContext.jsx';

const DEMO = [
  { id: 1, opponent: 'Rivera FC', date: new Date(Date.now()+2*86400000).toISOString(), venue: 'Home' },
  { id: 2, opponent: 'Coastal Academy', date: new Date(Date.now()+9*86400000).toISOString(), venue: 'Away' },
];

export default function ScheduleView() {
  const { role, session } = useAuth();
  const [fixtures, setFixtures] = useState(session?.demo ? DEMO : []);
  const [teamName, setTeamName] = useState('');

  useEffect(() => { if (session?.demo) { setTeamName('U15'); return; } (async () => {
    // team_id resolved by RLS-visible teams (player: own team, parent: child's team)
    const { data: teams } = await supabase.from('teams').select('id,name');
    const team = teams?.[0];
    setTeamName(team?.name || '');
    const { data } = await supabase.from('matches').select('id,opponent,date,venue,result')
      .gte('date', new Date().toISOString()).order('date');
    setFixtures(data || []);
  })(); }, []);

  return (
    <AppShell role={role} active="Schedule" title="Schedule">
      <div className="container" style={{ maxWidth: 680, padding: 0 }}>
        <div className="section-header"><h4 style={{ margin: 0 }}>Upcoming fixtures {teamName && `— ${teamName}`}</h4></div>
        {fixtures.length === 0 ? <div className="card"><p className="subtle" style={{ margin: 0 }}>No upcoming fixtures scheduled.</p></div> : (
          <div className="stack" style={{ gap: 10 }}>
            {fixtures.map((f) => (
              <div key={f.id} className="card row between">
                <div><strong>vs {f.opponent}</strong><div className="subtle" style={{ fontSize: 13 }}>{new Date(f.date).toLocaleString()}</div></div>
                <span className="badge badge-neutral">{f.venue || '—'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
