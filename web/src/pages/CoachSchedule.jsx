import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell.jsx';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from '../context/AuthContext.jsx';
import { myTeams } from '../lib/coach.js';

export default function CoachSchedule() {
  const { profile, session } = useAuth();
  const [teams, setTeams] = useState([]);
  const [teamId, setTeamId] = useState('');
  const [opponent, setOpponent] = useState('');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('Home');
  const [notify, setNotify] = useState(true);
  const [fixtures, setFixtures] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(''); const [ok, setOk] = useState('');

  useEffect(() => { if (session?.demo) return; (async () => {
    const t = await myTeams(profile.id); setTeams(t); if (t[0]) setTeamId(t[0].id);
  })(); }, []);
  useEffect(() => { if (teamId) loadFixtures(); }, [teamId]);

  async function loadFixtures() {
    const { data } = await supabase.from('matches').select('id,opponent,date,venue,result')
      .eq('team_id', teamId).gte('date', new Date().toISOString()).order('date');
    setFixtures(data || []);
  }

  async function schedule(e) {
    e.preventDefault(); setErr(''); setOk(''); setBusy(true);
    try {
      const { error } = await supabase.from('matches').insert({ team_id: teamId, opponent, date, venue });
      if (error) { setErr(error.message); return; }
      if (notify) {
        const team = teams.find((t) => t.id === teamId);
        const when = new Date(date).toLocaleString();
        await supabase.rpc('notify_team', { p_team: teamId, p_message: `New fixture: ${team?.name} vs ${opponent} — ${when} (${venue})` });
      }
      setOk('Fixture scheduled' + (notify ? ' and team notified.' : '.'));
      setOpponent(''); setDate(''); await loadFixtures();
    } finally { setBusy(false); }
  }

  if (session?.demo) return <AppShell role="coach" active="Schedule" title="Schedule"><div className="card">Demo mode — sign in as a real coach to schedule fixtures.</div></AppShell>;
  if (teams.length === 0) return <AppShell role="coach" active="Schedule" title="Schedule"><div className="card">No teams assigned yet.</div></AppShell>;

  return (
    <AppShell role="coach" active="Schedule" title="Schedule">
      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        <form className="card" onSubmit={schedule}>
          <h4>Schedule a fixture</h4>
          <div className="field"><label className="label">Team</label>
            <select className="select" value={teamId} onChange={(e) => setTeamId(e.target.value)}>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
          <div className="field"><label className="label">Opponent</label>
            <input className="input" value={opponent} onChange={(e) => setOpponent(e.target.value)} /></div>
          <div className="field"><label className="label">Date & time</label>
            <input className="input" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div className="field"><label className="label">Venue</label>
            <select className="select" value={venue} onChange={(e) => setVenue(e.target.value)}>
              {['Home','Away'].map((v) => <option key={v}>{v}</option>)}</select></div>
          <label className="row" style={{ gap: 8, marginBottom: 12 }}>
            <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
            <span>Notify players &amp; parents</span>
          </label>
          {err && <p style={{ color: 'var(--danger)', fontSize: 13 }}>{err}</p>}
          {ok &&  <p style={{ color: 'var(--green-700)', fontSize: 13 }}>{ok}</p>}
          <button className="btn btn-primary btn-block" disabled={busy || !opponent.trim() || !date}>{busy ? 'Saving…' : 'Schedule fixture'}</button>
        </form>

        <div className="card">
          <div className="section-header"><h4 style={{ margin: 0 }}>Upcoming fixtures</h4><span className="badge badge-neutral">{fixtures.length}</span></div>
          {fixtures.length === 0 ? <p className="subtle">No upcoming fixtures.</p> : (
            <div className="stack" style={{ gap: 10 }}>
              {fixtures.map((f) => (
                <div key={f.id} className="row between" style={{ paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                  <div><strong>vs {f.opponent}</strong><div className="subtle" style={{ fontSize: 13 }}>{new Date(f.date).toLocaleString()}</div></div>
                  <span className="badge badge-neutral">{f.venue}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
