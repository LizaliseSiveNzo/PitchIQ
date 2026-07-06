import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell.jsx';
import RankBadge from '../components/RankBadge.jsx';
import WeeklyHighlights from '../components/WeeklyHighlights.jsx';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from '../context/AuthContext.jsx';

const MEDALS = ['🥇', '🥈', '🥉'];
const initials = (n = '') => n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

export default function Leaderboard() {
  const { role } = useAuth();
  const [rows, setRows] = useState(null);

  useEffect(() => {
    supabase.rpc('team_leaderboard').then(({ data }) => setRows(data || []));
  }, []);

  return (
    <AppShell role={role} active="Leaderboard" title="Leaderboard">
      <div className="container" style={{ maxWidth: 680, padding: 0 }}>
        <WeeklyHighlights />
        <div className="section-header"><h4 style={{ margin: 0 }}>Season leaderboard</h4></div>
        {rows === null ? <div className="card">Loading…</div> :
         rows.length === 0 ? (
          <div className="card"><p className="subtle" style={{ margin: 0 }}>
            No leaderboard yet — rankings appear once training and matches are logged.</p></div>
        ) : (
          <div className="stack" style={{ gap: 10 }}>
            {rows.map((r) => (
              <div key={r.pos} className="card row between"
                style={r.me ? { borderLeft: '4px solid var(--energy)', background: 'var(--surface-2)' } : {}}>
                <div className="row" style={{ gap: 12 }}>
                  <span style={{ fontSize: 20, width: 34, textAlign: 'center', fontWeight: 800 }}>
                    {MEDALS[r.pos - 1] || `#${r.pos}`}
                  </span>
                  <span className="avatar">{initials(r.name)}</span>
                  <div>
                    <strong>{r.name}{r.me ? ' (you)' : ''}</strong>
                    <div className="subtle" style={{ fontSize: 13 }}>{r.position || '—'}</div>
                  </div>
                </div>
                <div className="row" style={{ gap: 12 }}>
                  <span className="subtle" style={{ fontSize: 13 }}>{r.score} pts</span>
                  <RankBadge level={r.rank || 'Rookie'} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
