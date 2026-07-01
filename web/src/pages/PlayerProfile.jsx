import RankBadge from '../components/RankBadge.jsx';
import StatCard from '../components/StatCard.jsx';
// TODO: wire to /api/player/me (Blueprint Prompt 3).
export default function PlayerProfile() {
  return (
    <div className="container">
      <h1 style={{ color: 'var(--accent)' }}>Player Profile</h1>
      <RankBadge level="Rising_Star" progress={45} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 12 }}>
        <StatCard label="Attendance" value="—" />
        <StatCard label="Match minutes" value="—" />
        <StatCard label="Avg rating" value="—" />
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <strong>AI Summary — Last 30 Days</strong>
        <p style={{ color: 'var(--text-muted)' }}>Generate via Claude API (Blueprint Prompt 6).</p>
      </div>
    </div>
  );
}
