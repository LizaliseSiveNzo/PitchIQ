# PitchIQ — Architecture

Monorepo (npm workspaces).

```
pitchiq/
├── backend/    Node.js + Express REST API (Supabase + Claude)
├── web/        React (Vite) — admin/coach/parent/player + public trial page
├── mobile/     React Native (Expo) — placeholder
├── supabase/   SQL migrations (schema + RLS)
└── docs/
```

## Roles & access
| Role   | Scope                                                        |
|--------|--------------------------------------------------------------|
| Admin  | Full access, all teams/players, export, invite coaches       |
| Coach  | Own team: training, ratings, notes, diet, bench reasons      |
| Parent | Own child only: stats, comments, fixtures, bench, diet       |
| Player | Own profile: rank/level, history, fixtures                   |

Access is enforced twice: Express `requireRole` middleware + Supabase RLS.

## Build sequence (from blueprint)
1. Auth  2. Player profiles  3. Stats logging  4. Schedule + notifications
5. Ranking  6. Trial QR check-in  7. AI coach summaries  8. Multi-sport
