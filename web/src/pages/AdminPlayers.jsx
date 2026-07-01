import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell.jsx';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from '../context/AuthContext.jsx';

const genCode = () => 'PIQ-' + Math.random().toString(36).slice(2, 7).toUpperCase();

export default function AdminPlayers() {
  const { session, profile } = useAuth();
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [form, setForm] = useState({ name: '', team_id: '', position: '', dob: '', medical: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [lastCode, setLastCode] = useState('');

  async function load() {
    const [{ data: pl }, { data: tm }] = await Promise.all([
      supabase.from('players').select('id,position,date_of_birth,rank_level,child_code,teams(name,division)').order('created_at', { ascending: false }),
      supabase.from('teams').select('id,name,division').order('division'),
    ]);
    setPlayers(pl || []);
    setTeams(tm || []);
  }
  useEffect(() => { if (!session?.demo) load(); }, []);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function addPlayer(e) {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      const child_code = genCode();
      // Create the user row for the player, then the player profile.
      const { data: u, error: ue } = await supabase.from('users')
        .insert({ name: form.name, email: `${child_code.toLowerCase()}@player.pitchiq.local`, role: 'player' })
        .select().single();
      if (ue) { setErr(ue.message); return; }
      const { error } = await supabase.from('players').insert({
        user_id: u.id,
        team_id: form.team_id || null,
        position: form.position || null,
        date_of_birth: form.dob || null,
        medical_notes: form.medical || null,
        child_code,
      });
      if (error) { setErr(error.message); return; }
      setLastCode(child_code);
      setForm({ name: '', team_id: '', position: '', dob: '', medical: '' });
      await load();
    } finally { setBusy(false); }
  }

  const noOrg = !session?.demo && profile && !profile.org_id;

  return (
    <AppShell role="admin" active="Players" title="Players">
      {session?.demo && <div className="badge badge-success" style={{ marginBottom: 16 }}>Demo mode — sign in with a real admin to save players</div>}
      {noOrg && <div className="card" style={{ marginBottom: 16 }}>Create your academy on the Dashboard first.</div>}
      {lastCode && <div className="card" style={{ marginBottom: 16, borderLeft: '4px solid var(--green-600)' }}>
        Player created. Child code for the parent to link: <strong>{lastCode}</strong></div>}

      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <h4>Add a player</h4>
          <form onSubmit={addPlayer}>
            <div className="field"><label className="label">Full name</label>
              <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} /></div>
            <div className="field"><label className="label">Team</label>
              <select className="select" value={form.team_id} onChange={(e) => set('team_id', e.target.value)}>
                <option value="">— Unassigned —</option>
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.division.replace('_',' ')})</option>)}
              </select></div>
            <div className="field"><label className="label">Position</label>
              <input className="input" placeholder="e.g. Winger" value={form.position} onChange={(e) => set('position', e.target.value)} /></div>
            <div className="field"><label className="label">Date of birth</label>
              <input className="input" type="date" value={form.dob} onChange={(e) => set('dob', e.target.value)} /></div>
            <div className="field"><label className="label">Medical notes (optional)</label>
              <textarea className="textarea" value={form.medical} onChange={(e) => set('medical', e.target.value)} /></div>
            {err && <p style={{ color: 'var(--danger)', fontSize: 13 }}>{err}</p>}
            <button className="btn btn-primary btn-block" disabled={busy || !form.name.trim() || noOrg}>{busy ? 'Saving…' : 'Add player'}</button>
          </form>
        </div>

        <div className="card">
          <div className="section-header"><h4 style={{ margin: 0 }}>Players</h4><span className="badge badge-neutral">{players.length}</span></div>
          {players.length === 0
            ? <p className="subtle">No players yet.</p>
            : <table className="table"><thead><tr><th>Team</th><th>Position</th><th>Rank</th><th>Child code</th></tr></thead>
                <tbody>{players.map((p) => (
                  <tr key={p.id}>
                    <td>{p.teams ? `${p.teams.name}` : '—'}</td>
                    <td>{p.position || '—'}</td>
                    <td><span className="badge badge-neutral">{(p.rank_level || 'Rookie').replace('_',' ')}</span></td>
                    <td><code>{p.child_code}</code></td>
                  </tr>
                ))}</tbody>
              </table>}
        </div>
      </div>
    </AppShell>
  );
}
