/** Subset of FTC Scout REST responses - api.ftcscout.org/rest/v1 */

export interface ScoutTeam {
  number: number;
  name?: string | null;
  schoolName?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  rookieYear?: number | null;
  website?: string | null;
}

export interface StatWithRank {
  value: number;
  rank: number;
}

export interface QuickStats {
  season: number;
  number: number;
  tot: StatWithRank;
  auto: StatWithRank;
  dc: StatWithRank;
  eg: StatWithRank;
  count: number;
}

export interface TeamEventParticipation {
  season: number;
  eventCode: string;
  teamNumber: number;
  stats?: TeamEventStatsDetail | null;
}

export interface TeamEventStatsDetail {
  rank?: number;
  opr?: {
    totalPointsNp?: number;
    autoPoints?: number;
    dcPoints?: number;
  };
  avg?: {
    totalPointsNp?: number;
    autoPoints?: number;
    dcPoints?: number;
  };
}
