import moment from 'moment';

import { Record, Stats, StatsHistory } from '../types';

const getNewCase = (records: Record[], key: string): number => {
  let secondLastNumber = 0;
  if (records.length > 1) {
    const secondLastRecord = records[records.length - 2];
    secondLastNumber = secondLastRecord[key];
  }

  let lastNumber = 0;
  if (records.length > 0) {
    const lastRecord = records[records.length - 1];
    lastNumber = lastRecord[key];
  }

  return lastNumber - secondLastNumber;
};

const getLastCase = (records: Record[], key: string): number => {
  let lastNumber = 0;
  if (records.length > 0) {
    const lastRecord = records[records.length - 1];
    lastNumber = lastRecord[key];
  }

  return lastNumber;
};

const getMaxLastUpdatedDate = (records: Record[]): string => {
  return records.reduce((accum, current) =>
    moment.utc(accum.lastUpdatedDate).unix() < moment.utc(current.lastUpdatedDate).unix() ? current : accum,
  ).lastUpdatedDate;
};

const mapHistory = (record: Record): StatsHistory => ({
  date: record.reportingDate,
  confirmed: record.confirmed,
  deaths: record.deaths,
  recovered: record.recovered,
  lastUpdatedDate: record.lastUpdatedDate,
});

export const mapToStats = (records: { [locationCode: string]: Record[] }): { [locationCode: string]: Stats } => {
  const stats = {} as { [regionCode: string]: Stats };

  Object.keys(records).forEach(locationCode => {
    const sortedLocationRecords = records[locationCode].sort(
      (recordA, recordB) => moment.utc(recordA.reportingDate).unix() - moment.utc(recordB.reportingDate).unix(),
    );

    const newlyConfirmedCases = getNewCase(sortedLocationRecords, 'confirmed');
    const newDeaths = getNewCase(sortedLocationRecords, 'deaths');
    const newlyRecoveredCases = getNewCase(sortedLocationRecords, 'recovered');

    const totalConfirmedCases = getLastCase(sortedLocationRecords, 'confirmed');
    const totalDeaths = getLastCase(sortedLocationRecords, 'deaths');
    const totalRecoveredCases = getLastCase(sortedLocationRecords, 'recovered');

    stats[locationCode] = {
      totalConfirmedCases,
      newlyConfirmedCases,
      totalDeaths,
      newDeaths,
      totalRecoveredCases,
      newlyRecoveredCases,
      lastUpdatedDate: getMaxLastUpdatedDate(sortedLocationRecords),
      history: sortedLocationRecords.map(record => mapHistory(record)),
    };
  });

  return stats;
};
