export interface Stats {
  totalConfirmedCases: number;
  newlyConfirmedCases: number;
  totalDeaths: number;
  newDeaths: number;
  totalRecoveredCases: number;
  newlyRecoveredCases: number;
  histories: StatsHistory[];
}

export interface StatsHistory {
  date: string;
  confirmed: string;
  deaths: string;
  recovered: string;
}
