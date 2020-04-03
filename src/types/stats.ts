export interface Stats {
  totalConfirmedCases: number;
  newlyConfirmedCases: number;
  totalDeaths: number;
  newDeaths: number;
  totalRecoveredCases: number;
  newlyRecoveredCases: number;
  lastUpdatedDate: string;
  history: StatsHistory[];
}

export interface StatsHistory {
  date: string;
  confirmed: number;
  deaths: number;
  recovered: number;
  lastUpdatedDate: string;
}
