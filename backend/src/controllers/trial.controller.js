// Trial controller — QR check-in + outcomes. (Blueprint Prompt 5)
export async function getTrialByToken(_req, res)  { res.status(501).json({ todo: 'resolve trial from qr_token' }); }
export async function registerTrialist(_req, res) { res.status(501).json({ todo: 'public: save trial_registration + confirmation' }); }
export async function createTrial(_req, res)      { res.status(501).json({ todo: 'admin: create trial + generate QR (qrcode pkg)' }); }
export async function listRegistrations(_req, res){ res.status(501).json({ todo: 'staff: list registrations for a trial' }); }
export async function setOutcome(_req, res)       { res.status(501).json({ todo: 'set accepted/declined + notify parent' }); }
