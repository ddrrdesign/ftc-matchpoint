import type { MatchResultModelV2, MatchResultTeamV2 } from "./types";

function stationSide(station: string | null | undefined): "red" | "blue" | null {
  if (!station) return null;
  const s = station.toUpperCase();
  if (s.includes("RED")) return "red";
  if (s.includes("BLUE")) return "blue";
  return null;
}

/** FTC match: two teams per alliance from station field */
export function teamsToAlliances(
  teams: MatchResultTeamV2[] | null | undefined
): { red: number[]; blue: number[] } {
  const red: number[] = [];
  const blue: number[] = [];
  if (!teams) return { red, blue };
  for (const t of teams) {
    const n = t.teamNumber;
    if (n == null) continue;
    const side = stationSide(t.station);
    if (side === "red") red.push(n);
    else if (side === "blue") blue.push(n);
  }
  return { red, blue };
}

export function matchLabel(m: MatchResultModelV2): string {
  if (m.description?.trim()) return m.description.trim();
  const lvl = (m.tournamentLevel ?? "").toUpperCase();
  const isPlayoff = lvl.includes("PLAYOFF") || lvl.includes("SEMIFINAL") || lvl.includes("FINAL");
  if (isPlayoff && m.series != null && m.matchNumber != null) {
    return `SF${m.series} M${m.matchNumber}`;
  }
  if (m.matchNumber != null) {
    return lvl.includes("QUAL") ? `Q ${m.matchNumber}` : `M ${m.matchNumber}`;
  }
  return "Match";
}

export function normalizeTournamentQuery(
  level: string
): "qual" | "playoff" | null {
  const u = level.toUpperCase();
  if (u === "QUAL" || u.includes("QUALIFICATION")) return "qual";
  if (
    u === "PLAYOFF" ||
    u.includes("PLAYOFF") ||
    u.includes("SEMIFINAL") ||
    u.includes("FINAL")
  )
    return "playoff";
  return null;
}
