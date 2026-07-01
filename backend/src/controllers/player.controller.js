// Player controller — own profile + AI summary.
import { generatePlayerSummary } from '../services/aiSummary.service.js';

export async function getMyProfile(_req, res) { res.status(501).json({ todo: 'profile, rank, history, fixtures' }); }

export async function getAiSummary(req, res, next) {
  try {
    // TODO: pull last 5 sessions, 3 match stats, 3 notes from DB for req.user's player
    const summary = await generatePlayerSummary({ stats: [], notes: [], sessions: [] });
    res.json({ summary });
  } catch (err) { next(err); }
}
