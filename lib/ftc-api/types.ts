/** Shapes we read from FTC Events API v2.0 (subset) */

export interface SeasonEventModelV2 {
  eventId?: string;
  code?: string | null;
  divisionCode?: string | null;
  name?: string | null;
  remote?: boolean;
  hybrid?: boolean;
  type?: string | null;
  typeName?: string | null;
  venue?: string | null;
  city?: string | null;
  stateprov?: string | null;
  country?: string | null;
  dateStart?: string;
  dateEnd?: string;
  published?: boolean;
}

export interface SeasonEventListingsV2 {
  events?: SeasonEventModelV2[] | null;
  eventCount?: number;
}

export interface TeamRankingModel {
  rank?: number;
  teamNumber?: number;
  teamName?: string | null;
  qualAverage?: number;
  wins?: number;
  losses?: number;
  ties?: number;
  matchesPlayed?: number;
}

export interface EventRankingsModel {
  rankings?: TeamRankingModel[] | null;
}

export interface MatchResultTeamV2 {
  teamNumber?: number;
  station?: string | null;
  dq?: boolean;
  onField?: boolean;
}

export interface MatchResultModelV2 {
  actualStartTime?: string | null;
  description?: string | null;
  tournamentLevel?: string | null;
  series?: number;
  matchNumber?: number;
  scoreRedFinal?: number;
  scoreBlueFinal?: number;
  teams?: MatchResultTeamV2[] | null;
}

export interface EventMatchResultsV2 {
  matches?: MatchResultModelV2[] | null;
}

export interface SeasonTeamModelV2 {
  teamNumber?: number;
  nameShort?: string | null;
  nameFull?: string | null;
  city?: string | null;
  stateProv?: string | null;
  country?: string | null;
}

export interface SeasonTeamListingsV2 {
  teams?: SeasonTeamModelV2[] | null;
  teamCountTotal?: number;
  teamCountPage?: number;
  pageCurrent?: number;
  pageTotal?: number;
}
