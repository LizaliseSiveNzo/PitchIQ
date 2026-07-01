import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell.jsx';
import StatCard from '../components/StatCard.jsx';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from '../context/AuthContext.jsx';

// ---- Demo (mock) dashboard, unchanged so "View as Admin" still looks full ----
function DemoDashboard() {
  const FIXTURES = [['U15 vs Rivera FC','Sat 10:00','Home'],['U13 vs Coastal Academy','Sat 12:30','Away'],['First Team vs Metro United','Sun 15:00','Home']];
  const TRIALS = [['Lwazi Dube','U13','Striker','pending'],['Aya Nkosi','U15','Midfield','accepted'],['Ben Carter','U11','Keeper','declined']];
  const chip = { accepted:'chip-accepted', declined:'chip-declined', pending:'chip-pending' };
  return (
    <>
      <div className="grid grid-4" style={{ marginBottom: 16 }}>
        <StatCard label="Total players" value="248" /><StatCard label="Teams" value="16" />
        <StatCard label="Avg attendance" value="87%" /><StatCard label="Trial pipeline" value="34" />
      </div>
      <div className="grid grid-2">
        <div className="card">
          <div className="section-header"><h4 style={{ margin: 0 }}>Upcoming fixtures</h4></div>
          <div className="stack" style={{ gap: 10 }}>
            {FIXTURES.map(([m,t,v]) => (
              <div key={m} className="row between" style={{ paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                <div><strong>{m}</strong><div className="subtle" style={{ fontSize: 13 }}>{t}</div></div>
                <span className="badge badge-neutral">{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="section-header"><h4 style={{ margin: 0 }}>Star player spotlight</h4><span className="badge badge-success">U13</span></div>
          <div className="row"><span className="avatar" style={{ width: 48, height: 48 }}>LK</span>
            <div><strong>Lerato Khumalo</strong><div className="subtle" style={{ fontSize: 13 }}>Master · 4.7 avg</div></div></div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <div className="section-header"><h4 style={{ margin: 0 }}>Recent trial registrations</h4></div>
        <table className="table"><thead><tr><th>Child</th><th>Division</th><th>Position</th><th>Outcome</th></tr></thead>
          <tbody>{TRIALS.map(([n,d,p,o]) => <tr key={n}><td>{n}</td><td>{d}</td><td>{p}</td><td><span className={`badge ${chip[o]}`}>{o}</span></td></tr>)}</tbody>
        </table>
      </div>
    </>
  );
}

// ---- Onboarding: create the academy (org) ----
function CreateAcademy({ onDone }) {
  const { profile, refreshProfile } = useAuth();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function create(e) {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      const { data, error } = await supabase.from('organisations').insert({ name }).select().single();
      if (error) { setErr(error.message); return; }
      const { error: e2 } = await supabase.from('users').update({ org_id: data.id }).eq('id', profile.id);
      if (e2) { setErr(e2.message); return; }
      await refreshProfile();
      onDone?.();
    } finally { setBusy(false); }
  }

  return (
    <div className="container" style={{ maxWidth: 440, padding: 0 }}>
      <div className="card">
        <h2>Set up your academy</h2>
        <p>Name your academy to get started. You can add teams and players next.</p>
        <form onSubmit={create}>
          <div className="field"><label className="label">Academy name</label>
            <input className="input" placeholder="e.g. Tux Academy" value={name} onChange={(e) => setName(e.target.value)} /></div>
          {err && <p style={{ color: 'var(--danger)', fontSize: 13 }}>{err}</p>}
          <button className="btn btn-primary btn-lg btn-block" disabled={busy || !name.trim()}>{busy ? 'Creating…' : 'Create academy'}</button>
        </form>
      </div>
    </div>
  );
}

// ---- Live dashboard for real accounts ----
function LiveDashboard() {
  const { profile } = useAuth();
  const [counts, setCounts] = useState({ players: 0, teams: 0 });

  async function load() {
    const [{ count: players }, { count: teams }] = await Promise.all([
      supabase.from('players').select('*', { count: 'exact', head: true }),
      supabase.from('teams').select('*', { count: 'exact', head: true }),
    ]);
    setCounts({ players: players || 0, teams: teams || 0 });
  }
  useEffect(() => { load(); }, []);

  return (
    <>
      <div className="grid grid-4" style={{ marginBottom: 16 }}>
        <StatCard label="Total players" value={counts.players} />
        <StatCard label="Teams" value={counts.teams} />
        <StatCard label="Avg attendance" value="—" />
        <StatCard label="Trial pipeline" value="—" />
      </div>
      <div className="card">
        <div className="section-header"><h4 style={{ margin: 0 }}>Get started</h4></div>
        <p>Build out your academy structure, then start logging stats (Phase 3).</p>
        <div className="row" style={{ gap: 10 }}>
          <Link to="/admin/teams" className="btn btn-primary">Manage teams</Link>
          <Link to="/admin/players" className="btn btn-secondary">Add players</Link>
        </div>
      </div>
    </>
  );
}

export default function AdminDashboard() {
  const { session, profile } = useAuth();
  const [, force] = useState(0);

  if (session?.demo) {
    return <AppShell role="admin" active="Dashboard" title="Dashboard"><DemoDashboard /></AppShell>;
  }

  const needsOrg = profile && !profile.org_id;
  return (
    <AppShell role="admin" active="Dashboard" title="Dashboard">
      {needsOrg
        ? <CreateAcademy onDone={() => force((n) => n + 1)} />
        : <LiveDashboard />}
    </AppShell>
  );
}
