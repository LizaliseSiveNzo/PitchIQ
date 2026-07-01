// Admin controller — full access to teams, players, reports, multi-sport.
export async function listTeams(_req, res)      { res.status(501).json({ todo: 'list all teams' }); }
export async function createTeam(_req, res)     { res.status(501).json({ todo: 'create team (org, division, sport)' }); }
export async function listAllPlayers(_req, res) { res.status(501).json({ todo: 'list all players' }); }
export async function exportReports(_req, res)  { res.status(501).json({ todo: 'export CSV/PDF reports' }); }
export async function addSport(_req, res)       { res.status(501).json({ todo: 'add sport type (multi-sport expansion)' }); }
