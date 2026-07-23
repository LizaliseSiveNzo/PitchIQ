/*
 * Copyright © 2026 Lizalise Nzo & Dumabezwe Skele. All rights reserved.
 * PitchIQ — proprietary and confidential. See LICENSE.
 */

import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from '../context/AuthContext.jsx';
import { ATTR_LABEL, groupAverages, overall, topAttrs } from '../lib/attributes.js';

const Stars = ({ n = 0 }) => (
  <span style={{ color: 'var(--warning)', letterSpacing: 1 }}>{'★'.repeat(n)}{'☆'.repeat(5 - n)}</span>
);
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : '—');
const initials = (n = '') => n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

const DEMO = {
  name: 'Thabo Mokoena', position: 'Winger', strong_foot: 'right', weak_foot: 3, height_cm: 178, weight_kg: 68.5,
  photo_url: null,
  attributes: { acceleration: 5, sprint_speed: 5, finishing: 4, shot_power: 4, long_shots: 3, short_passing: 4,
    vision: 4, crossing: 4, ball_control: 4, agility: 5, balance: 4, tackling: 2, marking: 2, interceptions: 3,
    strength: 3, stamina: 4, jumping: 3 },
};

// FIFA-style radial: photo in the centre, the six attribute groups arranged in a
// ring around it with a radar polygon showing the player's shape.
function AttributeRadial({ groups, photoUrl, name }) {
  const size = 300, c = size / 2, R = 118, labelR = 138, maxV = 5;
  const n = groups.length;
  const pt = (i, r) => {
    const a = (-90 + (360 / n) * i) * Math.PI / 180;      // start at top, clockwise
    return [c + r * Math.cos(a), c + r * Math.sin(a)];
  };
  const rings = [1, 2, 3, 4, 5];
  const poly = groups.map(([, v], i) => pt(i, (Math.max(v, 0) / maxV) * R).map((x) => x.toFixed(1)).join(',')).join(' ');

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '4px auto 0', maxWidth: '100%' }}>
      <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%" style={{ display: 'block', overflow: 'visible' }}>
        {/* concentric guide rings */}
        {rings.map((r) => (
          <polygon key={r}
            points={groups.map((_, i) => pt(i, (r / maxV) * R).map((x) => x.toFixed(1)).join(',')).join(' ')}
            fill="none" stroke="var(--border)" strokeWidth="1" opacity={r === maxV ? 0.9 : 0.5} />
        ))}
        {/* spokes */}
        {groups.map((_, i) => {
          const [x, y] = pt(i, R);
          return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="var(--border)" strokeWidth="1" opacity="0.5" />;
        })}
        {/* the player's shape */}
        <polygon points={poly} fill="var(--energy)" fillOpacity="0.18" stroke="var(--energy)" strokeWidth="2" strokeLinejoin="round" />
        {groups.map(([, v], i) => {
          const [x, y] = pt(i, (Math.max(v, 0) / maxV) * R);
          return <circle key={i} cx={x} cy={y} r="3.5" fill="var(--energy)" />;
        })}
      </svg>

      {/* centre photo */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 92, height: 92, borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--energy)',
        background: 'var(--energy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {photoUrl
          ? <img src={photoUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ color: '#fff', fontWeight: 800, fontSize: 26 }}>{initials(name)}</span>}
      </div>

      {/* group labels + values around the ring */}
      {groups.map(([g, v], i) => {
        const [x, y] = pt(i, labelR);
        const align = Math.abs(x - c) < 12 ? 'center' : (x < c ? 'right' : 'left');
        return (
          <div key={g} style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)',
            textAlign: align, width: 78, pointerEvents: 'none' }}>
            <div className="subtle" style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.03em' }}>{g}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: v ? 'var(--energy)' : 'var(--muted)' }}>{v ? v.toFixed(1) : '—'}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function PlayerCard({ playerId, editablePhoto = false }) {
  const { session } = useAuth();
  const [card, setCard] = useState(session?.demo ? DEMO : null);
  const [loading, setLoading] = useState(!session?.demo);
  const [photoSrc, setPhotoSrc] = useState('');
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRef = useRef(null);

  async function load() {
    const { data } = await supabase.rpc('player_card', { p_player: playerId ?? null });
    setCard(data); setLoading(false);
    if (data?.photo_url) {
      const { data: s } = await supabase.storage.from('player-files').createSignedUrl(data.photo_url, 3600);
      setPhotoSrc(s?.signedUrl || '');
    } else setPhotoSrc('');
  }
  useEffect(() => { if (session?.demo) return; load(); }, [playerId]);

  async function onPhoto(e) {
    const file = e.target.files?.[0];
    if (!file || !playerId) return;
    setUploading(true); setMsg('');
    try {
      if (!file.type.startsWith('image/')) { setMsg('Please choose an image.'); return; }
      if (file.size > 8 * 1024 * 1024) { setMsg('Image too large (max 8MB).'); return; }
      const ext = (file.name.split('.').pop() || 'jpg').replace(/[^\w]/g, '').slice(0, 5);
      const path = `${playerId}/avatar_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('player-files').upload(path, file, { contentType: file.type, upsert: true });
      if (upErr) { setMsg(upErr.message); return; }
      const { error } = await supabase.from('players').update({ photo_url: path }).eq('id', playerId);
      if (error) { setMsg(error.message); return; }
      setMsg('Photo updated.'); await load();
    } finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  }

  if (loading) return <div className="card" style={{ marginTop: 18 }}>Loading…</div>;
  if (!card) return null;

  const attrs = card.attributes || {};
  const ov = overall(attrs);
  const groups = groupAverages(attrs);
  const top = topAttrs(attrs);
  const hasRatings = ov > 0;

  return (
    <div className="card" style={{ marginTop: 0 }}>
      <div className="section-header">
        <h4 style={{ margin: 0 }}>⚡ Player Card</h4>
        <div className="row" style={{ gap: 8 }}>
          {card.position && <span className="badge badge-neutral">{card.position}</span>}
          {ov > 0 && <span className="badge badge-success" style={{ fontSize: 15, fontWeight: 800 }}>OVR {ov}</span>}
        </div>
      </div>

      {hasRatings
        ? <AttributeRadial groups={groups} photoUrl={photoSrc} name={card.name} />
        : (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ width: 92, height: 92, margin: '0 auto', borderRadius: '50%', overflow: 'hidden',
              border: '3px solid var(--energy)', background: 'var(--energy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {photoSrc ? <img src={photoSrc} alt={card.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ color: '#fff', fontWeight: 800, fontSize: 26 }}>{initials(card.name)}</span>}
            </div>
            <p className="subtle" style={{ margin: '12px 0 0' }}>No attribute ratings yet — your coach will rate these.</p>
          </div>
        )}

      {editablePhoto && (
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <input ref={fileRef} type="file" accept="image/*" onChange={onPhoto} style={{ display: 'none' }} />
          <button type="button" className="btn btn-secondary" style={{ minHeight: 34 }}
            onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? 'Uploading…' : (photoSrc ? '📷 Change photo' : '📷 Add your photo')}
          </button>
          {msg && <p style={{ color: msg.includes('updated') ? 'var(--green-700)' : 'var(--danger)', fontSize: 12, margin: '6px 0 0' }}>{msg}</p>}
        </div>
      )}

      {top.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div className="subtle" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>Strongest attributes</div>
          <div className="row" style={{ gap: 8, marginTop: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            {top.map(([k, v]) => <span key={k} className="badge badge-success">{ATTR_LABEL[k] || k} · {v}</span>)}
          </div>
        </div>
      )}

      <div className="grid grid-4" style={{ gap: 12, marginTop: 14 }}>
        <div className="kpi"><div className="kpi-label">Strong foot</div><div className="kpi-value" style={{ fontSize: 18 }}>{cap(card.strong_foot)}</div></div>
        <div className="kpi"><div className="kpi-label">Weak foot</div><div className="kpi-value" style={{ fontSize: 15 }}><Stars n={card.weak_foot || 0} /></div></div>
        <div className="kpi"><div className="kpi-label">Height</div><div className="kpi-value" style={{ fontSize: 18 }}>{card.height_cm ? `${card.height_cm}cm` : '—'}</div></div>
        <div className="kpi"><div className="kpi-label">Weight</div><div className="kpi-value" style={{ fontSize: 18 }}>{card.weight_kg ? `${card.weight_kg}kg` : '—'}</div></div>
      </div>
    </div>
  );
}
