// AI Coach Summary via the Claude API (Blueprint Prompt 6).
const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-6';

const SYSTEM_PROMPT = `You are a youth sports development assistant for PitchIQ. Given a player's recent
stats and coach notes, write a short encouraging but honest performance summary
(max 150 words). Include: what the player is doing well, one area to improve,
one practical home training tip. Write for both parent and a 13-year-old to understand.`;

export async function generatePlayerSummary({ stats, notes, sessions }) {
  const userContent = JSON.stringify({ recent_sessions: sessions, recent_matches: stats, coach_notes: notes });

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userContent }],
    }),
  });

  if (!resp.ok) throw new Error(`Claude API error: ${resp.status}`);
  const data = await resp.json();
  return data?.content?.[0]?.text ?? '';
}
