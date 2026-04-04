import type {
  Event,
  Match,
  MatchPrediction,
  Ranking,
  Season,
  Team,
  TeamEventStats,
} from "./types";

/**
 * Demo-only data: fictional Central Asia–style lineup so we do not mix
 * unrelated regions (e.g. US/EU teams) into a “Central Asia” story.
 */
export const MOCK_SEASON: Season = {
  id: "ftc-decode",
  name: "DECODE",
  year: 0,
};

export const MOCK_EVENTS: Event[] = [
  {
    id: "evt-ca-cas",
    code: "CA-CAS",
    name: "Central Asia Championship (sample)",
    location: "Astana, Kazakhstan",
    status: "completed",
    seasonId: MOCK_SEASON.id,
    startDate: "2026-02-10",
    endDate: "2026-02-13",
    teamCount: 24,
    matchCount: 72,
    predictionCount: 12,
    insightCount: 8,
    firstInspiresUrl:
      "https://ftc-events.firstinspires.org/2025/KZCMP",
  },
  {
    id: "evt-houston",
    code: "HOU-WORLD",
    name: "FIRST Championship - Houston (sample)",
    location: "Houston, TX",
    status: "upcoming",
    seasonId: MOCK_SEASON.id,
    startDate: "2026-04-16",
    endDate: "2026-04-19",
    teamCount: 192,
    matchCount: 420,
    predictionCount: 0,
    insightCount: 0,
    firstInspiresUrl:
      "https://ftc-events.firstinspires.org/2025/FTCCMP1",
  },
  {
    id: "evt-regional-sample",
    code: "REG-042",
    name: "Regional Qualifier (sample)",
    location: "Sample region",
    status: "completed",
    seasonId: MOCK_SEASON.id,
    startDate: "2025-11-08",
    endDate: "2025-11-09",
    teamCount: 32,
    matchCount: 64,
    predictionCount: 64,
    insightCount: 8,
    firstInspiresUrl: "https://ftc-events.firstinspires.org/#allevents",
  },
];

export const MOCK_TEAMS: Team[] = [
  { id: "t27772", number: 27772, name: "JelToqSun", region: "KZ" },
  { id: "t25001", number: 25001, name: "TalTech Robotics", region: "KZ" },
  { id: "t25002", number: 25002, name: "Orda STEAM", region: "KG" },
  { id: "t25003", number: 25003, name: "Samarkand Mechatronics", region: "UZ" },
  { id: "t25004", number: 25004, name: "Almaty Constructors", region: "KZ" },
];

export function getEventByCode(code: string): Event | undefined {
  return MOCK_EVENTS.find(
    (e) => e.code.toLowerCase() === decodeURIComponent(code).toLowerCase()
  );
}

export function getMatchBySlug(slug: string): Match | undefined {
  const decoded = decodeURIComponent(slug);
  const all = [...MOCK_MATCHES_HOME, MOCK_UPCOMING_MATCH];
  return all.find(
    (m) => m.slug === decoded || m.id === decoded || m.label === decoded
  );
}

export const MOCK_STATS_CA: TeamEventStats[] = [
  {
    teamId: "t27772",
    eventId: "evt-ca-cas",
    avgTotal: 205,
    avgAuto: 56,
    avgTeleop: 110,
    avgEndgame: 39,
    consistency: 0.84,
    recentForm: 0.32,
  },
  {
    teamId: "t25001",
    eventId: "evt-ca-cas",
    avgTotal: 188,
    avgAuto: 48,
    avgTeleop: 102,
    avgEndgame: 38,
    consistency: 0.78,
    recentForm: 0.12,
  },
  {
    teamId: "t25002",
    eventId: "evt-ca-cas",
    avgTotal: 182,
    avgAuto: 52,
    avgTeleop: 96,
    avgEndgame: 34,
    consistency: 0.72,
    recentForm: 0.08,
  },
  {
    teamId: "t25003",
    eventId: "evt-ca-cas",
    avgTotal: 176,
    avgAuto: 44,
    avgTeleop: 98,
    avgEndgame: 34,
    consistency: 0.7,
    recentForm: -0.05,
  },
  {
    teamId: "t25004",
    eventId: "evt-ca-cas",
    avgTotal: 198,
    avgAuto: 42,
    avgTeleop: 108,
    avgEndgame: 48,
    consistency: 0.68,
    recentForm: 0.22,
  },
];

export const MOCK_RANKINGS_CA: Ranking[] = [
  { rank: 1, teamNumber: 27772, avgScore: 205, trend: "up" },
  { rank: 2, teamNumber: 25004, avgScore: 198, trend: "flat" },
  { rank: 3, teamNumber: 25001, avgScore: 188, trend: "up" },
  { rank: 4, teamNumber: 25002, avgScore: 182, trend: "down" },
  { rank: 5, teamNumber: 25003, avgScore: 176, trend: "flat" },
];

export const MOCK_MATCHES_HOME: Match[] = [
  {
    id: "m-qf38",
    slug: "QF-38",
    eventId: "evt-ca-cas",
    label: "QF 38",
    phase: "playoff",
    red: { color: "red", teamNumbers: [27772, 25001] },
    blue: { color: "blue", teamNumbers: [25002, 25003] },
    redScore: 214,
    blueScore: 186,
    winner: "red",
  },
  {
    id: "m-qf39",
    slug: "QF-39",
    eventId: "evt-ca-cas",
    label: "QF 39",
    phase: "playoff",
    red: { color: "red", teamNumbers: [25004, 25002] },
    blue: { color: "blue", teamNumbers: [25001, 25003] },
    redScore: 198,
    blueScore: 191,
    winner: "red",
  },
  {
    id: "m-qf40",
    slug: "QF-40",
    eventId: "evt-ca-cas",
    label: "QF 40",
    phase: "playoff",
    red: { color: "red", teamNumbers: [27772, 25004] },
    blue: { color: "blue", teamNumbers: [25002, 25001] },
    redScore: 221,
    blueScore: 205,
    winner: "red",
  },
  {
    id: "m-qf41",
    slug: "QF-41",
    eventId: "evt-ca-cas",
    label: "QF 41",
    phase: "playoff",
    red: { color: "red", teamNumbers: [25003, 27772] },
    blue: { color: "blue", teamNumbers: [25004, 25001] },
    redScore: 196,
    blueScore: 208,
    winner: "blue",
  },
];

export const MOCK_UPCOMING_MATCH: Match = {
  id: "m-qf42",
  slug: "QF-42",
  eventId: "evt-ca-cas",
  label: "Qualification 42",
  phase: "qualification",
  red: { color: "red", teamNumbers: [27772, 25002] },
  blue: { color: "blue", teamNumbers: [25004, 25003] },
  scheduledTime: undefined,
};

export const MOCK_PREDICTION_SHOWCASE: MatchPrediction = {
  matchId: "m-qf42",
  redWinProbability: 0.62,
  blueWinProbability: 0.38,
  favored: "red",
  confidence: "medium",
  reasons: [
    "Red pairs the top-ranked scorer with a strong auto-heavy partner",
    "Blue’s peak is high but consistency scores are more volatile in sample stats",
    "Endgame contribution from Red’s first pick matches well against Blue’s DC profile",
  ],
};
