export interface Stats {
  totalConfirmedCases;
  newlyConfirmedCases;
  totalDeaths;
  newDeaths;
  totalRecoveredCases;
  newlyRecoveredCases;
  history: StatsHistory[];
}

export interface StatsHistory {
  date: string;
  confirmed: string;
  deaths: string;
  recovered: string;
}
