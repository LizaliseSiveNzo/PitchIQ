// Parent controller — read-only view of own child.
export async function getChildOverview(_req, res) { res.status(501).json({ todo: 'stats, comments, fixtures, bench reason, diet' }); }
