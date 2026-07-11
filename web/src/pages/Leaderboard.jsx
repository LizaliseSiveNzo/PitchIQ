/*
 * Copyright © 2026 Lizalise Nzo. All rights reserved.
 * PitchIQ — proprietary and confidential. See LICENSE.
 */

import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell.jsx';
import RankBadge from '../components/RankBadge.jsx';
import WeeklyHighlights from '../components/WeeklyHighlights.jsx';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from '../context/AuthContext.jsx';

const MEDALS = ['🥇', '🥈', '🥉'];
const initials = (n = '') => n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

const pct = (v) => `${Math.round(v)}%`;
const one = (v) => Number(v).toFixed(1);
const two = (v) => Number(v).toFixed(2);
const intf = (v) => String(Math.round(v));
const METRICS = [
  { key: 'avg_rating', label: 'Match rating', group: 'Overall', fmt: two, unit: 'avg' },
  { key: 'tot_minutes', label: 'Minutes played', group: 'Overall', fmt: intf, unit: 'total' },

  { key: 'tot_goals', label: 'Goals', group: 'Attacking', fmt: intf, unit: 'total' },
  { key: 'avg_goals', label: 'Goals per game', group: 'Attacking', fmt: two, unit: '/game' },
  { key: 'tot_assists', label: 'Assists', group: 'Attacking', fmt: intf, unit: 'total' },
  { key: 'tot_goal_contributions', label: 'Goal contributions (G+A)', group: 'Attacking', fmt: intf, unit: 'total' },
  { key: 'avg_goal_contributions', label: 'Goal contributions per game', group: 'Attacking', fmt: two, unit: '/game' },
  { key: 'avg_shots_on_target', label: 'Shots on target', group: 'Attacking', fmt: two, unit: '/game' },
  { key: 'avg_shots', label: 'Shots', group: 'Attacking', fmt: two, unit: '/game' },
  { key: 'avg_crosses', label: 'Crosses', group: 'Attacking', fmt: two, unit: '/game' },

  { key: 'avg_key_passes', label: 'Key passes', group: 'Passing', fmt: two, unit: '/game' },
  { key: 'avg_passes_completed', label: 'Passes completed', group: 'Passing', fmt: one, unit: '/game' },
  { key: 'pass_accuracy', label: 'Passing accuracy', group: 'Passing', fmt: pct, unit: '' },

  { key: 'avg_ball_carries', label: 'Ball carries', group: 'Ball progression', fmt: two, unit: '/game' },
  { key: 'avg_dribbles', label: 'Dribbles', group: 'Ball progression', fmt: two, unit: '/game' },

  { key: 'avg_def_contributions', label: 'Defensive actions', group: 'Defending', fmt: two, unit: '/game' },
  { key: 'avg_tackles', label: 'Tackles', group: 'Defending', fmt: two, unit: '/game' },
  { key: 'avg_interceptions', label: 'Interceptions', group: 'Defending', fmt: two, unit: '/game' },
  { key: 'avg_clearances', label: 'Clearances', group: 'Defending', fmt: two, unit: '/game' },
  { key: 'avg_blocks', label: 'Blocks', group: 'Defending', fmt: two, unit: '/game' },
  { key: 'avg_recoveries', label: 'Recoveries', group: 'Defending', fmt: two, unit: '/game' },

  { key: 'avg_aerials_won', label: 'Aerial duels won', group: 'Duels & physical', fmt: two, unit: '/game' },

  { key: 'avg_saves', label: 'Saves', group: 'Goalkeeping', fmt: two, unit: '/game' },
  { key: 'tot_clean_sheets', label: 'Clean sheets', group: 'Goalkeeping', fmt: intf, unit: 'total' },

  { key: 'avg_fouls_won', label: 'Fouls won', group: 'Discipline', fmt: two, unit: '/game' },
  { key: 'avg_fouls_committed', label: 'Fouls committed', group: 'Discipline', fmt: two, unit: '/game' },
  { key: 'tot_yellow_cards', label: 'Yellow cards', group: 'Discipline', fmt: intf, unit: 'total' },
  { key: 'tot_red_cards', label: 'Red cards', group: 'Discipline', fmt: intf, unit: 'total' },
];
const GROUPS = ['Overall', 'Attacking', 'Passing', 'Ball progression', 'Defending', 'Duels & physical', 'Goalkeeping', 'Discipline'];
const LEADERS = ['avg_rating', 'tot_goal_contributions', 'pass_accuracy', 'avg_ball_carries', 'avg_def_contributions', 'tot_clean_sheets'];

export default function Leaderboard() {
  const { role } = useAuth();
  const [season, setSeason] = useState(null);
  const [stats, setStats] = useState([]);
  const [metricKey, setMetricKey] = useState('avg_rating');

  useEffect(() => {
    supabase.rpc('team_leaderboard').then(({ data }) => setSeason(data || []));
    supabase.rpc('stat_leaderboard').then(({ data }) => setStats(data || []));
  }, []);

  const topN = role === 'player' ? 5 : 50;
  const metric = METRICS.find((m) => m.key === metricKey);
  const ranked = [...stats].filter((r) => Number(r[metricKey]) > 0).sort((a, b) => Number(b[metricKey]) - Number(a[metricKey]));
  const topFor = (key) => { const r = [...stats].filter((x) => Number(x[key]) > 0).sort((a, b) => Number(b[key]) - Number(a[key])); return r[0]; };

  return (
    <AppShell role={role} active="Leaderboard" title="Leaderboard">
      <div className="container" style={{ maxWidth: 720, padding: 0 }}>
        <WeeklyHighlights />

        {stats.length > 0 && (
          <>
            <div className="section-header"><h4 style={{ margin: 0 }}>Category leaders</h4></div>
            <div className="grid grid-3" style={{ marginBottom: 18 }}>
              {LEADERS.map((key) => {
                const m = METRICS.find((x) => x.key === key); const top = topFor(key);
                return (
                  <div key={key} className="card" style={{ padding: 14 }}>
                    <div className="subtle" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }}>{m.label}</div>
                    {top ? (
                      <div className="row" style={{ gap: 10, marginTop: 8 }}>
                        <span className="avatar">{initials(top.name)}</span>
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ display: 'block' }}>{top.name}</strong>
                          <span style={{ color: 'var(--green-700)', fontWeight: 800 }}>{m.fmt(top[key])}</span>
                          <span className="subtle" style={{ fontSize: 12 }}> {m.unit}</span>
                        </div>
                      </div>
                    ) : <p className="subtle" style={{ margin: '8px 0 0', fontSize: 13 }}>No data yet.</p>}
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="card" style={{ marginBottom: 18 }}>
          <div className="section-header"><h4 style={{ margin: 0 }}>Stat leaderboard</h4>{role === 'player' && <span className="badge badge-neutral">Top 5</span>}</div>
          <div className="field"><label className="label">Category</label>
            <select className="select" value={metricKey} onChange={(e) => setMetricKey(e.target.value)}>
              {GROUPS.map((g) => (
                <optgroup key={g} label={g}>
                  {METRICS.filter((m) => m.group === g).map((m) => <option key={m.key} value={m.key}>{m.label}{m.unit ? ` (${m.unit})` : ''}</option>)}
                </optgroup>
              ))}
            </select></div>
          {ranked.length === 0
            ? <p className="subtle" style={{ margin: 0 }}>No match stats logged for this category yet.</p>
            : (
              <div className="stack" style={{ gap: 6 }}>
                {ranked.slice(0, topN).map((r, i) => (
                  <div key={r.player_id} className="row between" style={{ padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 10 }}>
                    <div className="row" style={{ gap: 10, minWidth: 0 }}>
                      <span style={{ width: 28, textAlign: 'center', fontWeight: 800 }}>{MEDALS[i] || `#${i + 1}`}</span>
                      <span className="avatar">{initials(r.name)}</span>
                      <div style={{ minWidth: 0 }}>
                        <strong>{r.name}</strong>
                        <div className="subtle" style={{ fontSize: 12 }}>{r.team_name || '—'}{r.play_position ? ` · ${r.play_position}` : ''} · {r.games} games</div>
                      </div>
                    </div>
                    <strong style={{ color: 'var(--green-700)', whiteSpace: 'nowrap' }}>{metric.fmt(r[metricKey])}</strong>
                  </div>
                ))}
              </div>
            )}
        </div>

        <div className="section-header"><h4 style={{ margin: 0 }}>Season leaderboard</h4>{role === 'player' && <span className="badge badge-neutral">Top 5</span>}</div>
        {season === null ? <div className="card">Loading…</div> :
         season.length === 0 ? (
          <div className="card"><p className="subtle" style={{ margin: 0 }}>No leaderboard yet — rankings appear once training and matches are logged.</p></div>
        ) : (
          <div className="stack" style={{ gap: 10 }}>
            {season.map((r) => (
              <div key={r.pos} className="card row between" style={r.me ? { borderLeft: '4px solid var(--energy)', background: 'var(--surface-2)' } : {}}>
                <div className="row" style={{ gap: 12 }}>
                  <span style={{ fontSize: 20, width: 34, textAlign: 'center', fontWeight: 800 }}>{MEDALS[r.pos - 1] || `#${r.pos}`}</span>
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
