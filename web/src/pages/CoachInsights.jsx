/*
 * Copyright © 2026 Lizalise Nzo. All rights reserved.
 * PitchIQ — proprietary and confidential. See LICENSE.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell.jsx';
import InsightCards from '../components/InsightCards.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { myTeams, squadWithStats } from '../lib/coach.js';
import { teamInsights } from '../lib/insights.js';

export default function CoachInsights() {
  const { profile, session } = useAuth();
  const [teams, setTeams] = useState(null);
  const [teamId, setTeamId] = useState('');
  const [squad, setSquad] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (session?.demo) return; (async () => {
    const t = await myTeams(profile.id); setTeams(t); if (t[0]) setTeamId(t[0].id);
  })(); }, []);

  useEffect(() => { if (!teamId) return; (async () => {
    setLoading(true);
    try {
      const s = await squadWithStats(teamId);
      setSquad(s);
      setItems(await teamInsights(teamId, s));
    } finally { setLoading(false); }
  })(); }, [teamId]);

  if (session?.demo) return <AppShell role="coach" active="Insights" title="Insights"><div className="card">Demo mode — sign in as a real coach to see insights.</div></AppShell>;
  if (teams === null) return <AppShell role="coach" active="Insights" title="Insights"><div className="card">Loading…</div></AppShell>;
  if (teams.length === 0) return <AppShell role="coach" active="Insights" title="Insights"><div className="card">No teams yet. Create a team on your dashboard first.</div></AppShell>;

  const attended = squad.filter((p) => p.rate != null);
  const avgAtt = attended.length ? Math.round(attended.reduce((n, p) => n + p.rate, 0) / attended.length) : null;

  return (
    <AppShell role="coach" active="Insights" title="Squad Insights">
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="row between" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div className="field" style={{ margin: 0, minWidth: 220 }}>
            <label className="label">Team</label>
            <select className="select" value={teamId} onChange={(e) => setTeamId(e.target.value)}>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.division.replace('_',' ')})</option>)}
            </select>
          </div>
          <div className="row" style={{ gap: 8, alignSelf: 'end', flexWrap: 'wrap' }}>
            <span className="badge badge-neutral">{squad.length} players</span>
            {avgAtt != null && <span className="badge badge-neutral">{avgAtt}% avg attendance</span>}
          </div>
        </div>
        <p className="subtle" style={{ fontSize: 13, margin: '10px 0 0' }}>
          What the data suggests about this squad — trends, spread and where a block of work might help. These are prompts for your judgement, not verdicts.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="section-header"><h4 style={{ margin: 0 }}>💡 What stands out</h4></div>
        <InsightCards items={items} loading={loading} empty="Not enough data yet — log a few sessions and matches." />
      </div>

      <div className="card">
        <div className="section-header"><h4 style={{ margin: 0 }}>Player snapshot</h4><span className="badge badge-neutral">{squad.length}</span></div>
        {squad.length === 0 ? <p className="subtle" style={{ margin: 0 }}>No players on this team yet.</p> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ minWidth: 460 }}>
              <thead><tr><th>Player</th><th>Attendance</th><th>Minutes</th><th>Avg rating</th></tr></thead>
              <tbody>
                {[...squad].sort((a, b) => (b.rate ?? -1) - (a.rate ?? -1)).map((p) => (
                  <tr key={p.id}>
                    <td><Link to={`/coach/player/${p.id}`} style={{ color: 'inherit' }}>{p.name}</Link></td>
                    <td>{p.rate == null ? '—' : `${p.rate}%`}</td>
                    <td>{p.minutes || '—'}</td>
                    <td>{p.avg ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
