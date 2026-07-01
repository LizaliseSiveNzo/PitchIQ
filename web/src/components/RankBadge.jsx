// Rank badge chip. Colors come from design-system.css (.rank-<Level>).
export default function RankBadge({ level = 'Rookie' }) {
  return <span className={`rank-badge rank-${level}`}>◆ {level.replace('_', ' ')}</span>;
}
