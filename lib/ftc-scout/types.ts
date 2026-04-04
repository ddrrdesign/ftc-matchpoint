/** Subset of FTC Scout REST responses - api.ftcscout.org/rest/v1 */

/** Row from `GET /events/search/:season` (matches GraphQL Event scalars subset). */
export interface ScoutEventListItem {
  season: number;
  code: string;
  divisionCode?: string | null;
  name?: string | null;
  remote?: boolean;
  hybrid?: boolean;
  type?: string | null;
  regionCode?: string | null;
  venue?: string | null;
  address?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  start?: string | null;
  end?: string | null;
  published?: boolean;
}

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
  /** Omitted when numbers come from a single event (no season rank pool). */
  rank?: number;
}

export interface QuickStats {
  season: number;
  number: number;
  tot: StatWithRank;
  auto: StatWithRank;
  dc: StatWithRank;
  eg: StatWithRank;
  count: number;
  /**
   * When set, `tot`/`auto`/… reflect this event only (predictor), not season composite.
   * Example: `FTCCMP1` for FIRST Championship (check FTC Scout for the season’s code).
   */
  statsScopeEventCode?: string;
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
