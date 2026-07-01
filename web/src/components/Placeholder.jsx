export default function Placeholder({ title, note }) {
  return (
    <div className="container">
      <h1 style={{ color: 'var(--accent)' }}>{title}</h1>
      <p style={{ color: 'var(--text-muted)' }}>{note}</p>
    </div>
  );
}
