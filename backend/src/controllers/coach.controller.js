// Coach controller — training, matches, notes, squad, bench. (Blueprint Prompt 4)
export async function logTrainingSession(_req, res) { res.status(501).json({ todo: 'date + attendance per player + note' }); }
export async function logMatch(_req, res)           { res.status(501).json({ todo: 'opponent/date/result + per-player stats' }); }
export async function upsertPlayerNotes(_req, res)  { res.status(501).json({ todo: 'add note / diet plan to player' }); }
export async function benchPlayer(_req, res)        { res.status(501).json({ todo: 'mark benched + reason (visible to parent)' }); }
export async function getSquad(_req, res)           { res.status(501).json({ todo: 'squad list w/ attendance rate + avg rating' }); }
