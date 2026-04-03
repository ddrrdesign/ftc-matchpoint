import "server-only";

import { getFtcSeasonYear } from "./env";
import { ftcGet } from "./client";
import type {
  EventMatchResultsV2,
  EventRankingsModel,
  MatchResultModelV2,
  SeasonEventListingsV2,
  SeasonTeamListingsV2,
  SeasonTeamModelV2,
} from "./types";
import { matchLabel, normalizeTournamentQuery, teamsToAlliances } from "./match-utils";

export async function fetchEventListings(season?: number) {
  const y = season ?? getFtcSeasonYear();
  return ftcGet<SeasonEventListingsV2>(`/v2.0/${y}/events`);
}

export async function fetchSingleEvent(season: number, eventCode: string) {
  const q = new URLSearchParams({ eventCode });
  return ftcGet<SeasonEventListingsV2>(`/v2.0/${season}/events?${q}`);
}

export async function fetchRankings(season: number, eventCode: string) {
  const enc = encodeURIComponent(eventCode);
  return ftcGet<EventRankingsModel>(`/v2.0/${season}/rankings/${enc}`);
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
  m: MatchResultModelV2
): string {
  const level = normalizeTournamentQuery(m.tournamentLevel ?? "");
  const num = m.matchNumber ?? 0;
  if (level === "qual") {
    return `/matches/${encodeURIComponent(eventCode)}/qual/${num}`;
  }
  if (level === "playoff") {
    const s = m.series ?? 0;
    return `/matches/${encodeURIComponent(eventCode)}/playoff/${s}/${num}`;
  }
  return `/matches/${encodeURIComponent(eventCode)}/qual/${num}`;
}

export { matchLabel, teamsToAlliances, normalizeTournamentQuery };
