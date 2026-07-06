import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from '../context/AuthContext.jsx';

const KINDS = [['proof_of_payment', 'Proof of payment'], ['image', 'Image'], ['document', 'Document'], ['other', 'Other']];
const label = (k) => (KINDS.find((x) => x[0] === k) || ['', 'Other'])[1];

const DEMO = [
  { id: 1, file_name: 'proof_of_payment_march.pdf', kind: 'proof_of_payment', created_at: new Date().toISOString() },
  { id: 2, file_name: 'boot_size_photo.jpg', kind: 'image', created_at: new Date(Date.now() - 3 * 86400e3).toISOString() },
];

// Player uploads (proof of payment, images, docs). canUpload=false for the coach's read-only view.
export default function PlayerUploads({ playerId, canUpload = true }) {
  const { profile, session } = useAuth();
  const [pid, setPid] = useState(playerId || null);
  const [files, setFiles] = useState(session?.demo ? DEMO : []);
  const [kind, setKind] = useState('proof_of_payment');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => { if (session?.demo) return; (async () => {
    let id = playerId;
    if (!id) { const { data } = await supabase.from('players').select('id').limit(1); id = data?.[0]?.id; }
    setPid(id);
    if (id) load(id);
  })(); }, [playerId]);

  async function load(id) {
    const { data } = await supabase.from('player_files').select('*').eq('player_id', id).order('created_at', { ascending: false });
    setFiles(data || []);
  }

  async function onUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !pid) return;
    setErr(''); setBusy(true);
    try {
      const safe = file.name.replace(/[^\w.\-]/g, '_');
      const path = `${pid}/${Date.now()}_${safe}`;
      const { error: upErr } = await supabase.storage.from('player-files').upload(path, file, { upsert: false });
      if (upErr) { setErr(upErr.message); return; }
      const { error: insErr } = await supabase.from('player_files').insert({
        player_id: pid, uploaded_by: profile.id, path, file_name: file.name, mime: file.type, kind,
      });
      if (insErr) { setErr(insErr.message); return; }
      load(pid);
    } finally { setBusy(false); e.target.value = ''; }
  }

  async function download(f) {
    const { data, error } = await supabase.storage.from('player-files').createSignedUrl(f.path, 120);
    if (!error && data?.signedUrl) window.open(data.signedUrl, '_blank');
    else setErr(error?.message || 'Could not open file');
  }

  async function remove(f) {
    if (f.path) await supabase.storage.from('player-files').remove([f.path]);
    await supabase.from('player_files').delete().eq('id', f.id);
    load(pid);
  }

  return (
    <div className="card" style={{ marginTop: 18 }}>
      <div className="section-header">
        <h4 style={{ margin: 0 }}>📎 Documents &amp; uploads</h4>
        <span className="badge badge-neutral">{files.length}</span>
      </div>

      {canUpload && !session?.demo && (
        <div className="row" style={{ gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          <select className="select" style={{ maxWidth: 220 }} value={kind} onChange={(e) => setKind(e.target.value)}>
            {KINDS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
            {busy ? 'Uploading…' : 'Upload file'}
            <input type="file" onChange={onUpload} disabled={busy} style={{ display: 'none' }} />
          </label>
        </div>
      )}
      {err && <p style={{ color: 'var(--danger)', fontSize: 13 }}>{err}</p>}

      {files.length === 0
        ? <p className="subtle" style={{ margin: 0 }}>No files uploaded yet.</p>
        : (
          <div className="stack" style={{ gap: 8 }}>
            {files.map((f) => (
              <div key={f.id} className="row between" style={{ padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <strong style={{ fontSize: 14, wordBreak: 'break-all' }}>{f.file_name}</strong>
                  <div className="subtle" style={{ fontSize: 12, marginTop: 2 }}>
                    <span className="badge badge-neutral" style={{ fontSize: 10 }}>{label(f.kind)}</span> · {new Date(f.created_at).toLocaleDateString()}
                  </div>
                </div>
                {!session?.demo && (
                  <div className="row" style={{ gap: 8 }}>
                    <button className="btn btn-secondary" style={{ minHeight: 32 }} onClick={() => download(f)}>Download</button>
                    {(f.uploaded_by === profile?.id || profile?.role === 'admin') &&
                      <button className="btn btn-ghost" style={{ minHeight: 32 }} onClick={() => remove(f)}>Delete</button>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
