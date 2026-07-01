# PitchIQ — Backend (Node.js + Express)

REST API with Supabase (DB + auth) and Claude API (AI summaries).

## Run
```bash
cp .env.example .env   # fill in Supabase + Anthropic keys
npm install
npm run dev            # http://localhost:4000  (GET /health)
```

## Structure
- `src/config/supabase.js` — service-role + per-user clients
- `src/middleware/` — `authenticate`, `requireRole`, `errorHandler`
- `src/routes/` — `auth`, `admin`, `coach`, `parent`, `player`, `trials`
- `src/controllers/` — request handlers (stubs, phase-by-phase)
- `src/services/aiSummary.service.js` — Claude API integration
- `src/utils/ranking.js` — rank/level engine

Route protection mirrors the blueprint: `/admin/*` admin only,
`/coach/*` coaches+admins, `/parent/*` parents, `/player/*` players.
