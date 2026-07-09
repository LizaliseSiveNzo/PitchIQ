/*
 * Copyright © 2026 Lizalise Nzo. All rights reserved.
 * PitchIQ — proprietary and confidential. See LICENSE.
 */

import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell.jsx';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from '../context/AuthContext.jsx';
import { myTeams } from '../lib/coach.js';

export default function CoachAnnouncements() {
  const { profile, session } = useAuth();
  const [teams, setTeams] = useState([]);
  const [teamId, setTeamId] = useState('');
  const [list, setList] = useState([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [notify, setNotify] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(''); const [err, setErr] = useState('');

  useEffect(() => { if (session?.demo) return; (async () => {
    const t = await myTeams(profile.id); setTeams(t); if (t[0]) setTeamId(t[0].id);
  })(); }, []);
  useEffect(() => { if (teamId) load(); }, [teamId]);

  async function load() {
    const { data } = await supabase.from('announcements')
      .select('id,title,body,created_at').eq('team_id', teamId)
      .order('created_at', { ascending: false }).limit(30);
    setList(data || []);
  }

  async function post(e) {
    e.preventDefault(); setErr(''); setMsg(''); setBusy(true);
    try {
      const { error } = await supabase.from('announcements')
        .insert({ team_id: teamId, coach_id: profile.id, title: title.trim(), body: body.trim() || null });
      if (error) { setErr(error.message); return; }
      if (notify) await supabase.rpc('notify_team', { p_team: teamId, p_message: `📣 ${title.trim()}` });
      setMsg('Announcement posted.'); setTitle(''); setBody(''); load();
    } finally { setBusy(false); }
  }

  async function remove(id) {
    await supabase.from('announcements').delete().eq('id', id);
    load();
  }

  if (session?.demo) return <AppShell role="coach" active="Announcements" title="Announcements"><div className="card">Demo mode — sign in as a real coach to post announcements.</div></AppShell>;
  if (teams.length === 0) return <AppShell role="coach" active="Announcements" title="Announcements"><div className="card">No teams assigned yet.</div></AppShell>;

  return (
    <AppShell role="coach" active="Announcements" title="Announcements">
      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        <form className="card" onSubmit={post}>
          <h4>📣 Post to the whole team</h4>
          <div className="field"><label className="label">Team</label>
            <select className="select" value={teamId} onChange={(e) => setTeamId(e.target.value)}>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.division.replace('_',' ')})</option>)}
            </select></div>
          <div className="field"><label className="label">Title</label>
            <input className="input" placeholder="e.g. Practice moved to 17:00" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div className="field"><label className="label">Details (optional)</label>
            <textarea className="input" rows={4} placeholder="Anything the team and parents should know…"
              value={body} onChange={(e) => setBody(e.target.value)} /></div>
          <label className="row" style={{ gap: 8, marginBottom: 12 }}>
            <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
            <span>Also send as notification</span>
          </label>
          {msg && <p style={{ color: 'var(--green-700)', fontSize: 13, margin: '0 0 10px' }}>{msg}</p>}
          {err && <p style={{ color: 'var(--danger)', fontSize: 13, margin: '0 0 10px' }}>{err}</p>}
          <button className="btn btn-primary btn-block" disabled={busy || !title.trim()}>{busy ? 'Posting…' : 'Post announcement'}</button>
        </form>

        <div className="card">
          <div className="section-header"><h4 style={{ margin: 0 }}>Posted</h4><span className="badge badge-neutral">{list.length}</span></div>
          {list.length === 0 ? <p className="subtle">Nothing posted yet.</p> : (
            <div className="stack" style={{ gap: 12 }}>
              {list.map((a) => (
                <div key={a.id} style={{ paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                  <div className="row between">
                    <strong>{a.title}</strong>
                    <button className="btn btn-ghost" style={{ minHeight: 28, padding: '2px 8px' }} title="Delete" onClick={() => remove(a.id)}>✕</button>
                  </div>
                  {a.body && <p style={{ margin: '4px 0 0' }}>{a.body}</p>}
                  <div className="subtle" style={{ fontSize: 12, marginTop: 4 }}>{new Date(a.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
