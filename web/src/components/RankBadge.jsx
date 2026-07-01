import { theme } from '../theme.js';

// Rank badge with progress bar (Blueprint Prompt 3).
export default function RankBadge({ level = 'Rookie', progress = 0 }) {
  const color = theme.ranks[level] || theme.colors.textMuted;
  return (
    <div className="card" style={{ borderColor: color }}>
      <strong style={{ color }}>{level.replace('_', ' ')}</strong>
      <div style={{ height: 8, background: '#26313f', borderRadius: 6, marginTop: 8 }}>
        <div style={{ width: `${progress}%`, height: '100%', background: color, borderRadius: 6 }} />
      </div>
    </div>
  );
}
