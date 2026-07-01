// Rank engine: Rookie -> Rising Star -> Elite -> Master -> Grand Master
// Score from attendance rate (0-1), total match minutes, and avg coach rating (1-5).
export const RANKS = ['Rookie', 'Rising_Star', 'Elite', 'Master', 'Grand_Master'];

export function computeRank({ attendanceRate = 0, totalMinutes = 0, avgRating = 0 }) {
  // Weighted 0-100 score. Tune these weights as real data comes in.
  const score =
    attendanceRate * 40 +                     // up to 40
    Math.min(totalMinutes / 900, 1) * 30 +    // up to 30 (~10 full matches)
    (avgRating / 5) * 30;                      // up to 30

  if (score >= 85) return 'Grand_Master';
  if (score >= 70) return 'Master';
  if (score >= 50) return 'Elite';
  if (score >= 30) return 'Rising_Star';
  return 'Rookie';
}
