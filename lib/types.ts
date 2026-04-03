/** Domain model - ready for real API / DB later */

export type EventStatus = "live" | "upcoming" | "completed";

export type ConfidenceLevel = "low" | "medium" | "high";

export interface Season {
  id: string;
  name: string;
  year: number;
}

export interface Event {
  id: string;
  code: string;
  name: string;
  location: string;
  status: EventStatus;
  seasonId: string;
  startDate: string;
  endDate?: string;
  teamCount: number;
  matchCount: number;
  predictionCount: number;
  insightCount: number;
}

export interface Team {
  id: string;
  number: number;
  name: string;
  region?: string;
}

/** Per-team stats at a single event (MVP aggregates) */
export interface TeamEventStats {
  teamId: string;
  eventId: string;
  avgTotal: number;
  avgAuto: number;
  avgTeleop: number;
  avgEndgame: number;
  /** 0–1 higher = steadier scores */
  consistency: number;
  /** -1 to 1 trend vs event average */
  recentForm: number;
}

export interface Alliance {
  color: "red" | "blue";
  teamNumbers: [number, number];
}

export interface Match {
  id: string;
  /** URL segment, e.g. QF-42 */
  slug?: string;
  eventId: string;
  label: string;
  phase: "qualification" | "playoff";
  red: Alliance;
  blue: Alliance;
  redScore?: number;
  blueScore?: number;
  winner?: "red" | "blue";
  /** For upcoming */
  scheduledTime?: string;
}

export interface Ranking {
  rank: number;
  teamNumber: number;
  avgScore: number;
  trend: "up" | "down" | "flat";
}

export interface MatchPrediction {
  matchId: string;
  redWinProbability: number;
  blueWinProbability: number;
  favored: "red" | "blue";
  confidence: ConfidenceLevel;
  reasons: string[];
}
