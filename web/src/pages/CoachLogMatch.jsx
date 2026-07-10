/*
 * Copyright © 2026 Lizalise Nzo. All rights reserved.
 * PitchIQ — proprietary and confidential. See LICENSE.
 */

import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell.jsx';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from '../context/AuthContext.jsx';
import { myTeams, teamPlayers } from '../lib/coach.js';

const FIELDS = [
  'minutes','goals','assists','shots','shots_on_target','key_passes',
  'passes_completed','passes_attempted','ball_carries','dribbles',
  'tackles','interceptions','clearances','blocks','saves','fouls_won','fouls_committed',
];
const blank = () => { const o = { rating: '' }; FIELDS.forEach((f) => o[f] = 0); return o; };

// detailed stats shown under the "More" expander, grouped
const EXTRA = [
  ['shots','Shots'], ['shots_on_target','On target'], ['key_passes','Key passes'],
  ['passes_completed','Passes completed'], ['passes_attempted','Passes attempted'],
  ['ball_carries','Ball carries'], ['dribbles','Dribbles'],
  ['tackles','Tackles'], ['interceptions','Interceptions'], ['clearances','Clearances'], ['blocks','Blocks'],
  ['saves','Saves'], ['fouls_won','Fouls won'], ['fouls_committed','Fouls committed'],
];

export default function CoachLogMatch() {
  const { profile, session } = useAuth();
  const [teams, setTeams] = useState([]);
  const [teamId, setTeamId] = useState('');
  const [opponent, setOpponent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [result, setResult] = useState('');
  const [players, setPlayers] = useState([]);
  const [stats, setStats] = useState({});
  const [open, setOpen] = useState({});     // player_id -> details expanded
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  useEffect(() => { if (session?.demo) return; (async () => {
    const t = await myTeams(profile.id); setTeams(t); if (t[0]) setTeamId(t[0].id);
  })(); }, []);
  useEffect(() => { if (teamId) (async () => {
    const p = await teamPlayers(teamId); setPlayers(p);
    setStats(Object.fromEntries(p.map((x) => [x.id, blank()])));
  })(); }, [teamId]);

  function setStat(pid, k, v) { setStats((s) => ({ ...s, [pid]: { ...s[pid], [k]: v } })); }
  const num = (pid, k) => Number(stats[pid]?.[k]) || 0;

  async function save(e) {
    e.preventDefault(); setErr(''); setOk(''); setBusy(true);
    try {
      const { data: match, error } = await supabase.from('matches')
        .insert({ team_id: teamId, opponent, date, result }).select().single();
      if (error) { setErr(error.message); return; }
      const rows = players.map((p) => ({
        match_id: match.id, player_id: p.id,
        minutes_played: num(p.id, 'minutes'),
        rating: stats[p.id]?.rating === '' ? null : Number(stats[p.id].rating),
        goals: num(p.id, 'goals'), assists: num(p.id, 'assists'),
        shots: num(p.id, 'shots'), shots_on_target: num(p.id, 'shots_on_target'), key_passes: num(p.id, 'key_passes'),
        passes_completed: num(p.id, 'passes_completed'), passes_attempted: num(p.id, 'passes_attempted'),
        ball_carries: num(p.id, 'ball_carries'), dribbles: num(p.id, 'dribbles'),
        tackles: num(p.id, 'tackles'), interceptions: num(p.id, 'interceptions'),
        clearances: num(p.id, 'clearances'), blocks: num(p.id, 'blocks'),
        saves: num(p.id, 'saves'), fouls_won: num(p.id, 'fouls_won'), fouls_committed: num(p.id, 'fouls_committed'),
      }));
      const { error: e2 } = await supabase.from('player_match_stats').insert(rows);
      if (e2) { setErr(e2.message); return; }
      await supabase.rpc('recompute_team_ranks', { p_team: teamId });
      setOk('Match logged. Ranks & leaderboards updated.');
    } finally { setBusy(false); }
  }

  if (session?.demo) return <AppShell role="coach" active="Log Match" title="Log Match"><div className="card">Demo mode — sign in as a real coach to log a match.</div></AppShell>;
  if (teams.length === 0) return <AppShell role="coach" active="Log Match" title="Log Match"><div className="card">No teams assigned yet.</div></AppShell>;

  const numInput = (pid, k, w = 64) => (
    <input className="input" type="number" min="0" style={{ minHeight: 34, width: w, padding: '4px 8px' }}
      value={stats[pid]?.[k] ?? 0} onChange={(e) => setStat(pid, k, e.target.value)} />
  );

  return (
    <AppShell role="coach" active="Log Match" title="Log Match">
      <form className="card" onSubmit={save}>
        <div className="grid grid-4">
          <div className="field"><label className="label">Team</label>
            <select className="select" value={teamId} onChange={(e) => setTeamId(e.target.value)}>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
          <div className="field"><label className="label">Opponent</label>
            <input className="input" value={opponent} onChange={(e) => setOpponent(e.target.value)} /></div>
          <div className="field"><label className="label">Date</label>
            <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div className="field"><label className="label">Result</label>
            <input className="input" placeholder="e.g. 2-1" value={result} onChange={(e) => setResult(e.target.value)} /></div>
        </div>

        <h4 style={{ marginTop: 8 }}>Player stats</h4>
        <p className="subtle" style={{ marginTop: 0, fontSize: 13 }}>Enter the basics inline; tap “More stats” to record passing, ball carries, defending and goalkeeping.</p>
        {players.length === 0 ? <p className="subtle">No players on this team yet.</p> : (
          <div className="stack" style={{ gap: 8 }}>
            {players.map((p) => (
              <div key={p.id} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 10 }}>
                <div className="row between" style={{ flexWrap: 'wrap', gap: 8 }}>
                  <strong style={{ minWidth: 120 }}>{p.name}</strong>
                  <div className="row" style={{ gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    <label className="row" style={{ gap: 4 }}><span className="subtle" style={{ fontSize: 12 }}>Min</span>{numInput(p.id,'minutes',64)}</label>
                    <label className="row" style={{ gap: 4 }}><span className="subtle" style={{ fontSize: 12 }}>G</span>{numInput(p.id,'goals',52)}</label>
                    <label className="row" style={{ gap: 4 }}><span className="subtle" style={{ fontSize: 12 }}>A</span>{numInput(p.id,'assists',52)}</label>
                    <label className="row" style={{ gap: 4 }}><span className="subtle" style={{ fontSize: 12 }}>Rating</span>
                      <input className="input" type="number" step="0.1" min="0" max="5" placeholder="0-5" style={{ minHeight: 34, width: 66, padding: '4px 8px' }}
                        value={stats[p.id]?.rating ?? ''} onChange={(e) => setStat(p.id,'rating',e.target.value)} /></label>
                    <button type="button" className="btn btn-ghost" style={{ minHeight: 30, padding: '4px 10px' }}
                      onClick={() => setOpen((o) => ({ ...o, [p.id]: !o[p.id] }))}>{open[p.id] ? 'Less' : 'More stats'}</button>
                  </div>
                </div>
                {open[p.id] && (
                  <div className="grid grid-3" style={{ marginTop: 10, gap: 8 }}>
                    {EXTRA.map(([k, lbl]) => (
                      <label key={k} className="field" style={{ margin: 0 }}>
                        <span className="label" style={{ fontSize: 12 }}>{lbl}</span>
                        {numInput(p.id, k, '100%')}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {err && <p style={{ color: 'var(--danger)', fontSize: 13 }}>{err}</p>}
        {ok &&  <p style={{ color: 'var(--green-700)', fontSize: 13 }}>{ok}</p>}
        <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: 12 }} disabled={busy || !players.length || !opponent.trim()}>{busy ? 'Saving…' : 'Save match'}</button>
      </form>
    </AppShell>
  );
}
