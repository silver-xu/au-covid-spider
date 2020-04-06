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

const mapHistory = (record: Record, pastRecord?: Record): StatsHistory => {
  const pastConfirmed = pastRecord?.confirmed || 0;
  const pastDeaths = pastRecord?.deaths || 0;
  const pastRecovered = pastRecord?.recovered || 0;

  return {
    date: record.reportingDate,
    totalConfirmedCases: record.confirmed,
    newlyConfirmedCases: record.confirmed - pastConfirmed,
    currentConfirmedCases: record.confirmed - record.recovered - record.deaths,
    netNewlyConfirmedCases:
      record.confirmed - pastConfirmed - (record.recovered - pastRecovered) - (record.deaths - pastDeaths),
    totalDeaths: record.deaths,
    newDeaths: record.deaths - pastDeaths,
    totalRecoveredCases: record.recovered,
    newlyRecoveredCases: record.recovered - pastRecovered,
    lastUpdatedDate: record.lastUpdatedDate,
  };
};

export const mapToStats = (records: { [regionCode: string]: Record[] }): { [regionCode: string]: Stats } => {
  const stats = {} as { [regionCode: string]: Stats };

  Object.keys(records).forEach((regionCode) => {
    const sortedRegionRecords = records[regionCode].sort(
      (recordA, recordB) => moment.utc(recordA.reportingDate).unix() - moment.utc(recordB.reportingDate).unix(),
    );

    const newlyConfirmedCases = getNewCase(sortedRegionRecords, 'confirmed');
    const newDeaths = getNewCase(sortedRegionRecords, 'deaths');
    const newlyRecoveredCases = getNewCase(sortedRegionRecords, 'recovered');

    const totalConfirmedCases = getLastCase(sortedRegionRecords, 'confirmed');
    const totalDeaths = getLastCase(sortedRegionRecords, 'deaths');
    const totalRecoveredCases = getLastCase(sortedRegionRecords, 'recovered');

    stats[regionCode] = {
      totalConfirmedCases,
      newlyConfirmedCases,
      currentConfirmedCases: totalConfirmedCases - totalRecoveredCases - totalDeaths,
      netNewlyConfirmedCases: newlyConfirmedCases - newlyRecoveredCases - newDeaths,
      totalDeaths,
      newDeaths,
      totalRecoveredCases,
      newlyRecoveredCases,
      lastUpdatedDate: getMaxLastUpdatedDate(sortedRegionRecords),
      history: sortedRegionRecords.map((record, index) =>
        mapHistory(record, index > 0 ? sortedRegionRecords[index - 1] : undefined),
      ),
    };
  });

  return stats;
};
