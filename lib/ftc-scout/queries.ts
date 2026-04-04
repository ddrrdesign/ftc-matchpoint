import "server-only";

import { cache } from "react";

import { getFtcScoutPredictorEventCode, getFtcScoutSeason } from "./env";
import type {
  QuickStats,
  ScoutEventListItem,
  ScoutTeam,
  TeamEventParticipation,
  TeamEventStatsDetail,
} from "./types";
import { scoutGet, type ScoutResult } from "./client";

function invalidSeasonResponse(message: string): boolean {
  return /invalid season/i.test(message);
}

/** Tries preferred year, then fallbacks until Scout accepts the season (avoids 400 Invalid season). */
function seasonCandidates(preferred: number): number[] {
  const chain = [preferred, 2025, 2024, 2023].filter((y) => y >= 2020);
  return [...new Set(chain)];
}

/**
 * One probe per request: which season Scout currently serves (cached).
 * Use for UI copy so we show the real year after env says e.g. 2026.
 */
export const getEffectiveScoutSeason = cache(async (): Promise<number> => {
  const preferred = getFtcScoutSeason();
  for (const y of seasonCandidates(preferred)) {
    const r = await scoutGet<unknown>(
      `/teams/1/quick-stats?season=${y}`,
      { revalidate: 86_400 }
    );
    if (r.ok) return y;
    if (r.status === 400 && invalidSeasonResponse(r.message)) continue;
    break;
  }
  return preferred;
});

const SCOUT_EVENTS_SEARCH_LIMIT = 4000;

/** Public REST — same catalog as https://ftcscout.org/events/{season} */
export async function fetchScoutEventsSearch(
  season: number,
  opts?: { limit?: number; revalidate?: number }
) {
  const limit = Math.min(
    Math.max(opts?.limit ?? SCOUT_EVENTS_SEARCH_LIMIT, 1),
    5000
  );
  return scoutGet<ScoutEventListItem[]>(
    `/events/search/${season}?limit=${limit}`,
    {
      revalidate: opts?.revalidate ?? 1800,
      tags: ["scout-api", `scout-events-${season}`],
    }
  );
}

export function scoutEventWebUrl(season: number, code: string): string {
  const c = encodeURIComponent(code.trim());
  return `https://ftcscout.org/events/${season}/${c}`;
}

export async function fetchScoutEventsForSeasons(seasons: number[]) {
  const unique = [...new Set(seasons)].filter((y) => y >= 2018 && y <= 2100);
  return Promise.all(unique.map((s) => fetchScoutEventsSearch(s)));
}

export async function fetchScoutTeam(
  teamNumber: number,
  fetchOpts?: { revalidate?: number }
) {
  return scoutGet<ScoutTeam>(`/teams/${teamNumber}`, fetchOpts);
}

const SCOUT_FRESH = { revalidate: 120 } as const;

export async function fetchQuickStats(
  teamNumber: number,
  season?: number,
  fetchOpts?: { revalidate?: number }
) {
  const preferred = season ?? getFtcScoutSeason();
  let last: ScoutResult<QuickStats> = {
    ok: false,
    status: 400,
    message: "Invalid season",
  };
  for (const y of seasonCandidates(preferred)) {
    const res = await scoutGet<QuickStats>(
      `/teams/${teamNumber}/quick-stats?season=${y}`,
      fetchOpts
    );
    if (res.ok) return res;
    last = res;
    if (res.status === 400 && invalidSeasonResponse(res.message)) continue;
    return res;
  }
  return last;
}

export async function fetchTeamEvents(
  teamNumber: number,
  season?: number,
  fetchOpts?: { revalidate?: number }
) {
  const preferred = season ?? getFtcScoutSeason();
  let last: ScoutResult<TeamEventParticipation[]> = {
    ok: false,
    status: 400,
    message: "Invalid season",
  };
  for (const y of seasonCandidates(preferred)) {
    const res = await scoutGet<TeamEventParticipation[]>(
      `/teams/${teamNumber}/events/${y}`,
      fetchOpts
    );
    if (res.ok) return res;
    last = res;
    if (res.status === 400 && invalidSeasonResponse(res.message)) continue;
    return res;
  }
  return last;
}

function pickOprAvg(d: TeamEventStatsDetail | null | undefined) {
  const o = d?.opr;
  const a = d?.avg;
  return {
    tot: o?.totalPointsNp ?? a?.totalPointsNp ?? null,
    auto: o?.autoPoints ?? a?.autoPoints ?? null,
    dc: o?.dcPoints ?? a?.dcPoints ?? null,
  };
}

/** Build composite-style quick stats from one event’s OPR/avg (Championship slice). */
export function quickStatsFromEventParticipation(
  season: number,
  teamNumber: number,
  eventCode: string,
  p: TeamEventParticipation
): QuickStats | null {
  const picked = pickOprAvg(p.stats);
  if (
    picked.tot == null &&
    picked.auto == null &&
    picked.dc == null
  ) {
    return null;
  }
  const tot = picked.tot ?? 0;
  const auto = picked.auto ?? 0;
  const dc = picked.dc ?? 0;
  const eg = Math.max(0, tot - auto - dc);

  return {
    season: p.season ?? season,
    number: teamNumber,
    tot: { value: tot },
    auto: { value: auto },
    dc: { value: dc },
    eg: { value: eg },
    count: 0,
    statsScopeEventCode: eventCode,
  };
}

/**
 * For Predictor: season quick-stats, or — if `FTC_SCOUT_PREDICTOR_EVENT_CODE` is set —
 * stats from that event when the team has a row; otherwise same as `fetchQuickStats`.
 * Pass `evRes` from a single `fetchTeamEvents` call to avoid duplicate API requests.
 */
export async function fetchPredictorQuickStats(
  teamNumber: number,
  season: number,
  evRes: ScoutResult<TeamEventParticipation[]>
): Promise<ScoutResult<QuickStats>> {
  const y = season;
  const eventCode = getFtcScoutPredictorEventCode();
  if (!eventCode) {
    return fetchQuickStats(teamNumber, y, SCOUT_FRESH);
  }

  if (!evRes.ok) {
    return fetchQuickStats(teamNumber, y, SCOUT_FRESH);
  }

  const participation = evRes.data.find(
    (e) => e.eventCode?.toLowerCase() === eventCode.toLowerCase()
  );
  if (!participation) {
    return fetchQuickStats(teamNumber, y, SCOUT_FRESH);
  }

  const built = quickStatsFromEventParticipation(
    y,
    teamNumber,
    eventCode,
    participation
  );
  if (!built) {
    return fetchQuickStats(teamNumber, y, SCOUT_FRESH);
  }

  return { ok: true, data: built };
}

/** OPR total NP at a specific event, if present. */
export function oprTotalNpAtEvent(
  parts: TeamEventParticipation[] | null | undefined,
  eventCode: string | null
): number | null {
  if (!parts?.length || !eventCode?.trim()) return null;
  const ec = eventCode.trim().toLowerCase();
  const p = parts.find((e) => e.eventCode?.toLowerCase() === ec);
  const v = p?.stats?.opr?.totalPointsNp ?? p?.stats?.avg?.totalPointsNp;
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  return null;
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
