import { Difficulty } from "../config/tiers";

// Punkte pro richtig erkannter Fälschung, gewichtet nach Schwierigkeit.
// Im Tages-Leaderboard (pro Stufe) spielen alle dieselbe Stufe – das Gewicht
// wirkt vor allem im kombinierten Global-Ranking (schwere Stufen zählen mehr).
const POINTS_PER_DIFFICULTY: Record<Difficulty, number> = {
  leicht: 100,
  mittel: 200,
  schwer: 300,
};

export function pointsFor(difficulty: Difficulty): number {
  return POINTS_PER_DIFFICULTY[difficulty];
}
