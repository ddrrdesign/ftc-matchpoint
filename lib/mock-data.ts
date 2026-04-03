import type {
  Event,
  Match,
  MatchPrediction,
  Ranking,
  Season,
  Team,
  TeamEventStats,
} from "./types";

export const MOCK_SEASON: Season = {
  id: "ftc-2025-2026",
  name: "CENTERSTAGE",
  year: 2026,
};

export const MOCK_EVENTS: Event[] = [
  {
    id: "evt-ca-2026",
    code: "CA-2026",
    name: "Central Asia Championship 2026",
    location: "Almaty, KZ",
    status: "live",
    seasonId: MOCK_SEASON.id,
    startDate: "2026-03-14",
    endDate: "2026-03-16",
    teamCount: 48,
    matchCount: 96,
    predictionCount: 24,
    insightCount: 12,
  },
  {
    id: "evt-houston",
    code: "HOU-WORLD",
    name: "FIRST Championship - Houston",
    location: "Houston, TX",
    status: "upcoming",
    seasonId: MOCK_SEASON.id,
    startDate: "2026-04-18",
    teamCount: 192,
    matchCount: 420,
    predictionCount: 0,
    insightCount: 0,
  },
  {
    id: "evt-regional-sample",
    code: "REG-042",
    name: "Regional Qualifier",
    location: "Sample region",
    status: "completed",
    seasonId: MOCK_SEASON.id,
    startDate: "2026-01-10",
    endDate: "2026-01-12",
    teamCount: 32,
    matchCount: 64,
    predictionCount: 64,
    insightCount: 8,
  },
];

export const MOCK_TEAMS: Team[] = [
  { id: "t27772", number: 27772, name: "Kazakhstan Robotics", region: "KZ" },
  { id: "t19458", number: 19458, name: "Alliance Forge", region: "US" },
  { id: "t14522", number: 14522, name: "Circuit Breakers", region: "US" },
  { id: "t21009", number: 21009, name: "Endgame Prime", region: "CA" },
  { id: "t12345", number: 12345, name: "Auto Architects", region: "EU" },
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
    eventId: "evt-ca-2026",
    avgTotal: 210,
    avgAuto: 58,
    avgTeleop: 112,
    avgEndgame: 40,
    consistency: 0.82,
    recentForm: 0.35,
  },
  {
    teamId: "t19458",
    eventId: "evt-ca-2026",
    avgTotal: 180,
    avgAuto: 44,
    avgTeleop: 98,
    avgEndgame: 38,
    consistency: 0.71,
    recentForm: 0.1,
  },
  {
    teamId: "t14522",
    eventId: "evt-ca-2026",
    avgTotal: 190,
    avgAuto: 48,
    avgTeleop: 105,
    avgEndgame: 37,
    consistency: 0.76,
    recentForm: 0.22,
  },
  {
    teamId: "t12345",
    eventId: "evt-ca-2026",
    avgTotal: 160,
    avgAuto: 40,
    avgTeleop: 90,
    avgEndgame: 30,
    consistency: 0.65,
    recentForm: -0.15,
  },
];

export const MOCK_RANKINGS_CA: Ranking[] = [
  { rank: 1, teamNumber: 27772, avgScore: 210, trend: "up" },
  { rank: 2, teamNumber: 14522, avgScore: 190, trend: "flat" },
  { rank: 3, teamNumber: 19458, avgScore: 180, trend: "down" },
  { rank: 4, teamNumber: 12345, avgScore: 160, trend: "up" },
];

export const MOCK_MATCHES_HOME: Match[] = [
  {
    id: "m-qf38",
    slug: "QF-38",
    eventId: "evt-ca-2026",
    label: "QF 38",
    phase: "playoff",
    red: { color: "red", teamNumbers: [27772, 19458] },
    blue: { color: "blue", teamNumbers: [14522, 21009] },
    redScore: 214,
    blueScore: 186,
    winner: "red",
  },
  {
    id: "m-qf39",
    slug: "QF-39",
    eventId: "evt-ca-2026",
    label: "QF 39",
    phase: "playoff",
    red: { color: "red", teamNumbers: [10333, 24560] },
    blue: { color: "blue", teamNumbers: [11111, 22222] },
    redScore: 172,
    blueScore: 190,
    winner: "blue",
  },
  {
    id: "m-qf40",
    slug: "QF-40",
    eventId: "evt-ca-2026",
    label: "QF 40",
    phase: "playoff",
    red: { color: "red", teamNumbers: [17777, 18888] },
    blue: { color: "blue", teamNumbers: [27772, 14444] },
    redScore: 201,
    blueScore: 209,
    winner: "blue",
  },
  {
    id: "m-qf41",
    slug: "QF-41",
    eventId: "evt-ca-2026",
    label: "QF 41",
    phase: "playoff",
    red: { color: "red", teamNumbers: [54321, 27772] },
    blue: { color: "blue", teamNumbers: [21111, 22212] },
    redScore: 226,
    blueScore: 181,
    winner: "red",
  },
];

export const MOCK_UPCOMING_MATCH: Match = {
  id: "m-qf42",
  slug: "QF-42",
  eventId: "evt-ca-2026",
  label: "Qualification 42",
  phase: "qualification",
  red: { color: "red", teamNumbers: [11111, 22222] },
  blue: { color: "blue", teamNumbers: [33333, 44444] },
  scheduledTime: "2026-03-15T14:30:00",
};

export const MOCK_PREDICTION_SHOWCASE: MatchPrediction = {
  matchId: "m-qf42",
  redWinProbability: 0.68,
  blueWinProbability: 0.32,
  favored: "red",
  confidence: "medium",
  reasons: [
    "Stronger autonomous average across both red partners",
    "Lower score variance in last three matches",
    "More reliable endgame conversion at this event",
  ],
};
