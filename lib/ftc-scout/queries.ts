import "server-only";

import { getFtcScoutSeason } from "./env";
import type {
  QuickStats,
  ScoutTeam,
  TeamEventParticipation,
} from "./types";
import { scoutGet } from "./client";

export async function fetchScoutTeam(teamNumber: number) {
  return scoutGet<ScoutTeam>(`/teams/${teamNumber}`);
}

export async function fetchQuickStats(teamNumber: number, season?: number) {
  const y = season ?? getFtcScoutSeason();
  return scoutGet<QuickStats>(`/teams/${teamNumber}/quick-stats?season=${y}`);
}

export async function fetchTeamEvents(teamNumber: number, season?: number) {
  const y = season ?? getFtcScoutSeason();
  return scoutGet<TeamEventParticipation[]>(`/teams/${teamNumber}/events/${y}`);
}

/** Search teams by number fragment or name (FTC Scout REST). */
export async function fetchTeamsSearch(searchText: string, limit = 40) {
  const t = searchText.trim();
  if (!t) {
    return { ok: true as const, data: [] as ScoutTeam[] };
  }
  const params = new URLSearchParams({
    searchText: t,
    limit: String(Math.min(Math.max(limit, 1), 50)),
  });
  return scoutGet<ScoutTeam[]>(`/teams/search?${params.toString()}`);
}

/** Max OPR total NP across events this season (proxy for “best OPR”). */
export function maxOprTotalNp(
  parts: TeamEventParticipation[] | null | undefined
): number | null {
  if (!parts?.length) return null;
  let max = -Infinity;
  for (const p of parts) {
    const v = p.stats?.opr?.totalPointsNp;
    if (typeof v === "number" && !Number.isNaN(v)) max = Math.max(max, v);
  }
  return max === -Infinity ? null : max;
}
