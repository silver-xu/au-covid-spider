export interface BaseStats {
  totalConfirmedCases: number;
  netTotalConfirmedCases: number;
  newlyConfirmedCases: number;
  netNewlyConfirmedCases: number;
  totalDeaths: number;
  newDeaths: number;
  totalRecoveredCases: number;
  newlyRecoveredCases: number;
  lastUpdatedDate: string;
}

export interface Stats extends BaseStats {
  history: StatsHistory[];
}

export interface StatsHistory extends BaseStats {
  date: string;
  lastUpdatedDate: string;
}
