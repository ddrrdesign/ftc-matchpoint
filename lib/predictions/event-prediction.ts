import {
  matchHasFinalScores,
  teamsToAlliances,
} from "@/lib/ftc-api/match-utils";
import type { MatchResultModelV2, TeamRankingModel } from "@/lib/ftc-api/types";
import {
  allianceStrength,
  confidenceFromStrengthGap,
  winProbabilities,
} from "@/lib/prediction";
import type { ConfidenceLevel, TeamEventStats } from "@/lib/types";

export type DataRichness = "sparse" | "moderate" | "rich";

function mean(a: number[]): number {
  if (a.length === 0) return 0;
  return a.reduce((x, y) => x + y, 0) / a.length;
}

function stdev(a: number[]): number {
  if (a.length < 2) return 0;
  const mu = mean(a);
  return Math.sqrt(mean(a.map((x) => (x - mu) ** 2)));
}

/** Per-team alliance scores when that team was on the field (red or blue total for that match). */
export function allianceScoresByTeam(
  matches: MatchResultModelV2[]
): Map<number, number[]> {
  const m = new Map<number, number[]>();
  for (const match of matches) {
    if (!matchHasFinalScores(match)) {
      continue;
    }
    const { red, blue } = teamsToAlliances(match.teams);
    const rs = match.scoreRedFinal;
    const bs = match.scoreBlueFinal;
    for (const t of red) {
      if (t == null || t <= 0) continue;
      const arr = m.get(t) ?? [];
      arr.push(rs);
      m.set(t, arr);
    }
    for (const t of blue) {
      if (t == null || t <= 0) continue;
      const arr = m.get(t) ?? [];
      arr.push(bs);
      m.set(t, arr);
    }
  }
  return m;
}

/** Counts matches usable for the model (final scores + teams), with or without `actualStartTime`. */
export function countPlayedMatches(matches: MatchResultModelV2[]): number {
  return matches.filter(matchHasFinalScores).length;
}

function neutralStats(teamNumber: number): TeamEventStats {
  return {
    teamId: `t${teamNumber}`,
    eventId: "api-event",
    avgTotal: 100,
    avgAuto: 25,
    avgTeleop: 55,
    avgEndgame: 20,
    consistency: 0.5,
    recentForm: 0,
  };
}

function statsFromRankingRow(
  teamNumber: number,
  r: TeamRankingModel
): TeamEventStats {
  const base = r.qualAverage ?? 0;
  const w = r.wins ?? 0;
  const l = r.losses ?? 0;
  const t = r.ties ?? 0;
  const dec = w + l + t;
  const winPct = dec > 0 ? w / dec : 0.5;
  const consistency = Math.min(0.92, 0.42 + winPct * 0.55);
  return {
    teamId: `t${teamNumber}`,
    eventId: "api-event",
    avgTotal: base,
    avgAuto: base * 0.25,
    avgTeleop: base * 0.55,
    avgEndgame: base * 0.2,
    consistency,
    recentForm: 0,
  };
}

function statsFromMatchScores(teamNumber: number, scores: number[]): TeamEventStats {
  if (scores.length === 0) return neutralStats(teamNumber);
  const avg = mean(scores);
  const sd = stdev(scores);
  const consistency = Math.max(0.38, Math.min(0.9, 1 - sd / 48));
  let recentForm = 0;
  if (scores.length >= 4) {
    const early = mean(scores.slice(0, Math.ceil(scores.length / 2)));
    const late = mean(scores.slice(Math.floor(scores.length / 2)));
    recentForm = Math.max(-1, Math.min(1, (late - early) / 35));
  }
  return {
    teamId: `t${teamNumber}`,
    eventId: "api-event",
    avgTotal: avg,
    avgAuto: avg * 0.25,
    avgTeleop: avg * 0.55,
    avgEndgame: avg * 0.2,
    consistency,
    recentForm,
  };
}

/**
 * One TeamEventStats per registered team using qual rankings when present,
 * else match-strength proxy from alliance scores, else neutral (≈50/50 world).
 */
export function buildEventStatsMap(
  rankings: TeamRankingModel[],
  matches: MatchResultModelV2[],
  registeredNumbers: number[]
): Map<number, TeamEventStats> {
  const byRank = new Map<number, TeamRankingModel>();
  for (const r of rankings) {
    if (r.teamNumber != null) byRank.set(r.teamNumber, r);
  }
  const scoresByTeam = allianceScoresByTeam(matches);
  const m = new Map<number, TeamEventStats>();

  for (const num of registeredNumbers) {
    const r = byRank.get(num);
    const scores = scoresByTeam.get(num) ?? [];
    if (r?.qualAverage != null && r.qualAverage > 0) {
      m.set(num, statsFromRankingRow(num, r));
    } else if (scores.length > 0) {
      m.set(num, statsFromMatchScores(num, scores));
    } else {
      m.set(num, neutralStats(num));
    }
  }
  return m;
}

export function avgMatchesPerTeamOnRoster(
  scoresByTeam: Map<number, number[]>,
  registeredNumbers: number[]
): number {
  if (registeredNumbers.length === 0) return 0;
  let s = 0;
  for (const t of registeredNumbers) {
    s += scoresByTeam.get(t)?.length ?? 0;
  }
  return s / registeredNumbers.length;
}

export function dataRichnessFromVolume(
  playedAtEvent: number,
  avgTeamMatches: number
): DataRichness {
  if (playedAtEvent < 8 || avgTeamMatches < 2) return "sparse";
  if (playedAtEvent < 36 || avgTeamMatches < 5) return "moderate";
  return "rich";
}

/** Pull win probability toward 50% when the event is still data-poor. */
export function blendProbabilityTowardNeutral(
  p: number,
  richness: DataRichness
): number {
  const w = richness === "sparse" ? 0.32 : richness === "moderate" ? 0.68 : 1;
  return 0.5 + (p - 0.5) * w;
}

export function capConfidenceByRichness(
  gapBased: ConfidenceLevel,
  richness: DataRichness
): ConfidenceLevel {
  if (richness === "sparse") return "low";
  if (richness === "moderate") {
    if (gapBased === "high") return "medium";
    return gapBased;
  }
  return gapBased;
}

export type EventAlliancePrediction = {
  redWin: number;
  blueWin: number;
  favored: "red" | "blue";
  confidence: ConfidenceLevel;
  rawRedWin: number;
  richness: DataRichness;
  playedMatches: number;
  avgTeamMatches: number;
  rosterSize: number;
};

export function predictAllianceMatchup(
  red: [number, number],
  blue: [number, number],
  stats: Map<number, TeamEventStats>,
  playedMatches: number,
  avgTeamMatches: number
): EventAlliancePrediction | null {
  const rs0 = stats.get(red[0]);
  const rs1 = stats.get(red[1]);
  const bs0 = stats.get(blue[0]);
  const bs1 = stats.get(blue[1]);
  if (!rs0 || !rs1 || !bs0 || !bs1) return null;

  const rS = allianceStrength(rs0, rs1);
  const bS = allianceStrength(bs0, bs1);
  const raw = winProbabilities(rS, bS);
  const richness = dataRichnessFromVolume(playedMatches, avgTeamMatches);
  const redWin = blendProbabilityTowardNeutral(raw.red, richness);
  const blueWin = 1 - redWin;
  const gapConf = confidenceFromStrengthGap(rS, bS);
  const confidence = capConfidenceByRichness(gapConf, richness);

  return {
    redWin,
    blueWin,
    favored: redWin >= blueWin ? "red" : "blue",
    confidence,
    rawRedWin: raw.red,
    richness,
    playedMatches,
    avgTeamMatches,
    rosterSize: stats.size,
  };
}
