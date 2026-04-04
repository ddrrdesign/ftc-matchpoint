/** Shapes we read from FTC Events API v2.0 (subset) */

export interface SeasonEventModelV2 {
  eventId?: string;
  code?: string | null;
  divisionCode?: string | null;
  name?: string | null;
  remote?: boolean;
  hybrid?: boolean;
  fieldCount?: number;
  type?: string | null;
  typeName?: string | null;
  regionCode?: string | null;
  venue?: string | null;
  address?: string | null;
  city?: string | null;
  stateprov?: string | null;
  country?: string | null;
  website?: string | null;
  liveStreamUrl?: string | null;
  webcasts?: string[] | null;
  timezone?: string | null;
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
  displayTeamNumber?: string | null;
  teamName?: string | null;
  sortOrder1?: number;
  sortOrder2?: number;
  sortOrder3?: number;
  sortOrder4?: number;
  sortOrder5?: number;
  sortOrder6?: number;
  qualAverage?: number;
  wins?: number;
  losses?: number;
  ties?: number;
  matchesPlayed?: number;
  matchesCounted?: number;
  dq?: number;
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

/** `/v2.0/{season}/awards/{eventCode}` */
export interface AwardAssignmentModelV2 {
  awardId?: number;
  teamId?: number | null;
  teamNumber?: number | null;
  name?: string | null;
  series?: number;
  schoolName?: string | null;
  fullTeamName?: string | null;
  person?: string | null;
  eventCode?: string | null;
  eventDivisionId?: number | null;
}

export interface AwardsModelV2 {
  awards?: AwardAssignmentModelV2[] | null;
}
