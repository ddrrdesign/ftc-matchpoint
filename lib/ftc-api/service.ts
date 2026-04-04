import "server-only";

import { getFtcSeasonYear } from "./env";
import { ftcGet } from "./client";
import type {
  AwardsModelV2,
  EventMatchResultsV2,
  EventRankingsModel,
  MatchResultModelV2,
  SeasonEventListingsV2,
  SeasonEventModelV2,
  SeasonTeamListingsV2,
  SeasonTeamModelV2,
} from "./types";
import { matchLabel, normalizeTournamentQuery, teamsToAlliances } from "./match-utils";

export async function fetchEventListings(season?: number) {
  const y = season ?? getFtcSeasonYear();
  return ftcGet<SeasonEventListingsV2>(`/v2.0/${y}/events`);
}

export type SeasonEventChunk = {
  season: number;
  events: SeasonEventModelV2[];
  ok: boolean;
  status?: number;
};

/** Parallel listings for multiple seasons (same endpoint as FTC Event Web per year). */
export async function fetchEventListingsForSeasons(
  seasons: number[]
): Promise<SeasonEventChunk[]> {
  return Promise.all(
    seasons.map(async (season) => {
      const res = await fetchEventListings(season);
      if (!res) {
        return { season, events: [], ok: false };
      }
      if (!res.ok) {
        return {
          season,
          events: [],
          ok: false,
          status: res.status,
        };
      }
      return { season, events: res.data.events ?? [], ok: true };
    })
  );
}

export async function fetchSingleEvent(season: number, eventCode: string) {
  const q = new URLSearchParams({ eventCode });
  return ftcGet<SeasonEventListingsV2>(`/v2.0/${season}/events?${q}`);
}

/**
 * Resolves `eventCode` to a listing row, trying the requested API season and
 * ±1 year (FIRST sometimes uses adjacent season keys for the same game year).
 */
export async function fetchEventDetailContext(
  eventCode: string,
  preferredSeason: number
): Promise<{
  season: number;
  list: SeasonEventModelV2[];
  ev: SeasonEventModelV2;
} | null> {
  const norm = eventCode.trim().toLowerCase();
  if (!norm) return null;
  const candidates = [
    preferredSeason,
    preferredSeason - 1,
    preferredSeason + 1,
  ].filter((y) => y >= 2000 && y <= 2100);
  const unique = [...new Set(candidates)];
  for (const y of unique) {
    const res = await fetchSingleEvent(y, eventCode);
    if (!res?.ok) continue;
    const list = res.data.events ?? [];
    const ev = list.find(
      (e) => (e.code ?? "").trim().toLowerCase() === norm
    );
    if (!ev?.code?.trim()) continue;
    return { season: y, list, ev };
  }
  return null;
}

export async function fetchRankings(season: number, eventCode: string) {
  const enc = encodeURIComponent(eventCode);
  return ftcGet<EventRankingsModel>(`/v2.0/${season}/rankings/${enc}`);
}

export async function fetchEventAwards(season: number, eventCode: string) {
  const enc = encodeURIComponent(eventCode);
  return ftcGet<AwardsModelV2>(`/v2.0/${season}/awards/${enc}`);
}

export async function fetchMatches(
  season: number,
  eventCode: string,
  level: "qual" | "playoff"
) {
  const enc = encodeURIComponent(eventCode);
  const q = new URLSearchParams({ tournamentLevel: level });
  return ftcGet<EventMatchResultsV2>(
    `/v2.0/${season}/matches/${enc}?${q}`
  );
}

export async function fetchTeamCountAtEvent(
  season: number,
  eventCode: string
): Promise<number | null> {
  const q = new URLSearchParams({ eventCode, page: "1" });
  const res = await ftcGet<SeasonTeamListingsV2>(
    `/v2.0/${season}/teams?${q}`
  );
  if (!res?.ok) return null;
  const t = res.data.teamCountTotal;
  if (typeof t === "number" && t >= 0) return t;
  const len = res.data.teams?.length;
  return typeof len === "number" ? len : null;
}

/** Parallel team-count lookups (one page-1 request per code). */
export async function fetchTeamCountsForEventCodes(
  season: number,
  codes: string[],
  concurrency = 8
): Promise<Map<string, number | null>> {
  const out = new Map<string, number | null>();
  if (codes.length === 0) return out;
  let index = 0;
  async function worker() {
    while (true) {
      const i = index++;
      if (i >= codes.length) break;
      const code = codes[i]!;
      const n = await fetchTeamCountAtEvent(season, code);
      out.set(code, n);
    }
  }
  const workers = Math.min(concurrency, codes.length);
  await Promise.all(Array.from({ length: workers }, () => worker()));
  return out;
}

export function teamCountCacheKey(season: number, code: string): string {
  return `${season}:${code.trim()}`;
}

/** One batched teams?page=1 pass per distinct season in `pairs`. */
export async function fetchTeamCountsForSeasonCodePairs(
  pairs: { season: number; code: string }[],
  concurrencyPerSeason = 10
): Promise<Map<string, number | null>> {
  const out = new Map<string, number | null>();
  const bySeason = new Map<number, string[]>();
  for (const { season, code } of pairs) {
    const c = code.trim();
    if (!c) continue;
    const arr = bySeason.get(season) ?? [];
    if (!arr.includes(c)) arr.push(c);
    bySeason.set(season, arr);
  }
  await Promise.all(
    [...bySeason.entries()].map(async ([season, codes]) => {
      const m = await fetchTeamCountsForEventCodes(
        season,
        codes,
        concurrencyPerSeason
      );
      for (const code of codes) {
        out.set(teamCountCacheKey(season, code), m.get(code) ?? null);
      }
    })
  );
  return out;
}

export async function fetchTeamsAtEvent(season: number, eventCode: string) {
  const all: SeasonTeamModelV2[] = [];
  let page = 1;
  const maxPages = 40;

  for (; page <= maxPages; page++) {
    const q = new URLSearchParams({
      eventCode,
      page: String(page),
    });
    const res = await ftcGet<SeasonTeamListingsV2>(
      `/v2.0/${season}/teams?${q}`
    );
    if (!res) break;
    if (!res.ok) break;
    const batch = res.data.teams ?? [];
    if (batch.length === 0) break;
    all.push(...batch);
    const total = res.data.pageTotal ?? 1;
    if (page >= total) break;
  }

  return all;
}

export async function fetchTeamByNumber(season: number, teamNumber: number) {
  const q = new URLSearchParams({ teamNumber: String(teamNumber) });
  return ftcGet<SeasonTeamListingsV2>(`/v2.0/${season}/teams?${q}`);
}

export async function fetchOneMatch(
  season: number,
  eventCode: string,
  level: "qual" | "playoff",
  matchNumber: number,
  series?: number
) {
  const enc = encodeURIComponent(eventCode);
  const q = new URLSearchParams({
    tournamentLevel: level,
    matchNumber: String(matchNumber),
  });
  const res = await ftcGet<EventMatchResultsV2>(
    `/v2.0/${season}/matches/${enc}?${q}`
  );
  if (!res?.ok) return null;
  const list = res.data.matches ?? [];
  if (series != null) {
    return (
      list.find((m) => m.series === series && m.matchNumber === matchNumber) ??
      list[0] ??
      null
    );
  }
  return list[0] ?? null;
}

/** All played matches for an event (qual + playoff), newest-ish last */
export async function fetchAllMatchesForEvent(
  season: number,
  eventCode: string
) {
  const [qual, playoff] = await Promise.all([
    fetchMatches(season, eventCode, "qual"),
    fetchMatches(season, eventCode, "playoff"),
  ]);
  const out: MatchResultModelV2[] = [];
  if (qual?.ok && qual.data.matches) out.push(...qual.data.matches);
  if (playoff?.ok && playoff.data.matches) out.push(...playoff.data.matches);
  return out;
}

export function matchHref(
  eventCode: string,
  m: MatchResultModelV2,
  seasonYear?: number
): string {
  const level = normalizeTournamentQuery(m.tournamentLevel ?? "");
  const num = m.matchNumber ?? 0;
  let path: string;
  if (level === "qual") {
    path = `/matches/${encodeURIComponent(eventCode)}/qual/${num}`;
  } else if (level === "playoff") {
    const s = m.series ?? 0;
    path = `/matches/${encodeURIComponent(eventCode)}/playoff/${s}/${num}`;
  } else {
    path = `/matches/${encodeURIComponent(eventCode)}/qual/${num}`;
  }
  if (seasonYear != null) {
    return `${path}?season=${encodeURIComponent(String(seasonYear))}`;
  }
  return path;
}

export { matchLabel, teamsToAlliances, normalizeTournamentQuery };
