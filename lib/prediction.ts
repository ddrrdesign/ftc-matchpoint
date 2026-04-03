import type { ConfidenceLevel, TeamEventStats } from "./types";

/** Weighted strength from team event stats (MVP). */
export function teamStrength(s: TeamEventStats): number {
  return (
    s.avgTotal * 0.45 +
    s.avgAuto * 0.2 +
    s.avgTeleop * 0.2 +
    s.avgEndgame * 0.15 +
    s.consistency * 12 +
    s.recentForm * 25
  );
}

export function allianceStrength(
  a: TeamEventStats,
  b: TeamEventStats
): number {
  return teamStrength(a) + teamStrength(b);
}

export function winProbabilities(
  redStrength: number,
  blueStrength: number
): { red: number; blue: number } {
  const diff = redStrength - blueStrength;
  const scale = 18;
  const red = 1 / (1 + Math.exp(-diff / scale));
  return { red, blue: 1 - red };
}

/** Alliance sum of FTC Scout composite Total NP (~200–400 typical). Softer scale. */
export function winProbabilitiesFromScoutTotals(
  redAllianceTotalNp: number,
  blueAllianceTotalNp: number
): { red: number; blue: number } {
  const diff = redAllianceTotalNp - blueAllianceTotalNp;
  const scale = 28;
  const red = 1 / (1 + Math.exp(-diff / scale));
  return { red, blue: 1 - red };
}

export function confidenceFromStrengthGap(
  redStrength: number,
  blueStrength: number
): ConfidenceLevel {
  const gap = Math.abs(redStrength - blueStrength);
  if (gap < 8) return "low";
  if (gap < 22) return "medium";
  return "high";
}
