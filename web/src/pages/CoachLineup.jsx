import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppShell from '../components/AppShell.jsx';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from '../context/AuthContext.jsx';
import { myTeams, teamPlayers } from '../lib/coach.js';

export default function CoachLineup() {
  const { profile, session } = useAuth();
  const [params] = useSearchParams();
  const wantMatch = params.get('match');

  const [teams, setTeams] = useState([]);
  const [teamId, setTeamId] = useState('');
  const [matches, setMatches] = useState([]);
  const [matchId, setMatchId] = useState('');
  const [players, setPlayers] = useState([]);
  const [sel, setSel] = useState({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(''); const [err, setErr] = useState('');

  useEffect(() => { if (session?.demo) return; (async () => {
    const t = await myTeams(profile.id);
    setTeams(t);
    if (wantMatch) {
      const { data: m } = await supabase.from('matches').select('team_id').eq('id', wantMatch).single();
      setTeamId(m?.team_id || t[0]?.id || '');
    } else if (t[0]) setTeamId(t[0].id);
  })(); }, []);

  useEffect(() => { if (!teamId) return; (async () => {
    const { data: ms } = await supabase.from('matches').select('id,opponent,date').eq('team_id', teamId).order('date', { ascending: false });
    setMatches(ms || []);
    const pref = wantMatch && (ms || []).some((m) => m.id === wantMatch) ? wantMatch : (ms?.[0]?.id || '');
    setMatchId(pref);
    setPlayers(await teamPlayers(teamId));
  })(); }, [teamId]);

  useEffect(() => { if (!matchId) { setSel({}); return; } (async () => {
    const { data } = await supabase.from('match_lineups').select('player_id,status,position').eq('match_id', matchId);
    const m = {}; (data || []).forEach((r) => { m[r.player_id] = { status: r.status, position: r.position || '' }; });
    setSel(m);
  })(); }, [matchId]);

  const setStatus = (pid, status) => setSel((s) => ({ ...s, [pid]: { ...(s[pid] || { position: '' }), status } }));
  const setPos = (pid, position) => setSel((s) => ({ ...s, [pid]: { ...(s[pid] || { status: 'starter' }), position } }));

  const starters = players.filter((p) => sel[p.id]?.status === 'starter').length;
  const bench = players.filter((p) => sel[p.id]?.status === 'bench').length;

  async function save() {
    setBusy(true); setErr(''); setMsg('');
    try {
      const rows = []; const removeIds = [];
      players.forEach((p) => {
        const s = sel[p.id];
        if (s && s.status) rows.push({ match_id: matchId, player_id: p.id, status: s.status, position: s.position || null });
        else removeIds.push(p.id);
      });
      if (removeIds.length) await supabase.from('match_lineups').delete().eq('match_id', matchId).in('player_id', removeIds);
      if (rows.length) {
        const { error } = await supabase.from('match_lineups').upsert(rows, { onConflict: 'match_id,player_id' });
        if (error) { setErr(error.message); return; }
      }
      setMsg(`Lineup saved — ${rows.filter((r) => r.status === 'starter').length} starting, ${rows.filter((r) => r.status === 'bench').length} on the bench.`);
    } finally { setBusy(false); }
  }

  if (session?.demo) return <AppShell role="coach" active="Lineup" title="Lineup"><div className="card">Demo mode — sign in as a real coach to build lineups.</div></AppShell>;
  if (teams.length === 0) return <AppShell role="coach" active="Lineup" title="Lineup"><div className="card">No teams assigned yet.</div></AppShell>;

  return (
    <AppShell role="coach" active="Lineup" title="Match Lineup">
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="grid grid-2">
          <div className="field" style={{ margin: 0 }}><label className="label">Team</label>
            <select className="select" value={teamId} onChange={(e) => setTeamId(e.target.value)}>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
          <div className="field" style={{ margin: 0 }}><label className="label">Match</label>
            <select className="select" value={matchId} onChange={(e) => setMatchId(e.target.value)}>
              {matches.length === 0 && <option value="">No matches — schedule a fixture first</option>}
              {matches.map((m) => <option key={m.id} value={m.id}>vs {m.opponent} · {new Date(m.date).toLocaleDateString()}</option>)}</select></div>
        </div>
      </div>

      {matchId ? (
        <div className="card">
          <div className="section-header"><h4 style={{ margin: 0 }}>Pick your XI</h4>
            <div className="row" style={{ gap: 8 }}>
              <span className="badge badge-success">{starters} starting</span>
              <span className="badge badge-neutral">{bench} bench</span></div></div>
          {players.length === 0 ? <p className="subtle">No players on this team.</p> : (
            <div className="stack" style={{ gap: 8 }}>
              {players.map((p) => {
                const s = sel[p.id] || {};
                return (
                  <div key={p.id} className="row between" style={{ padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 10, flexWrap: 'wrap', gap: 8 }}>
                    <span className="row" style={{ minWidth: 140 }}><span className="avatar">{p.name.split(' ').map((w) => w[0]).join('')}</span> {p.name}</span>
                    <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                      <div className="segmented">
                        <button type="button" aria-selected={s.status === 'starter'} onClick={() => setStatus(p.id, 'starter')}>Start</button>
                        <button type="button" aria-selected={s.status === 'bench'} onClick={() => setStatus(p.id, 'bench')}>Bench</button>
                        <button type="button" aria-selected={!s.status} onClick={() => setStatus(p.id, '')}>—</button>
                      </div>
                      {s.status === 'starter' && <input className="input" style={{ width: 120, minHeight: 34 }} placeholder="Position" value={s.position || ''} onChange={(e) => setPos(p.id, e.target.value)} />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {err && <p style={{ color: 'var(--danger)', fontSize: 13 }}>{err}</p>}
          {msg && <p style={{ color: 'var(--green-700)', fontSize: 13 }}>{msg}</p>}
          <button className="btn btn-primary btn-block" style={{ marginTop: 12 }} onClick={save} disabled={busy || !matchId}>{busy ? 'Saving…' : 'Save lineup'}</button>
        </div>
      ) : <div className="card"><p className="subtle" style={{ margin: 0 }}>Schedule a fixture first (Schedule tab), then set its lineup here.</p></div>}
    </AppShell>
  );
}
