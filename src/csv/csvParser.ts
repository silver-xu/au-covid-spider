import moment from 'moment';
import neatCsv from 'neat-csv';

import { Record } from '../types/record';

import { default as regions } from '../config/regions.json';
import { default as countries } from '../config/countries.json';

const toIsoDate = (dateString: string): string =>
  moment.utc(dateString, 'M/D/YYYY HH:mm', true).toISOString() ||
  moment.utc(dateString, 'M/D/YYYY', true).toISOString() ||
  moment.utc(dateString, 'M/D/YY HH:mm', true).toISOString() ||
  moment.utc(dateString, 'M/D/YY', true).toISOString() ||
  moment.utc(dateString, moment.ISO_8601, true).toISOString();

const getSum = (parsedData: Record[], date: string, initialDate: string, region?: string): Record | undefined => {
  const sum = parsedData
    .filter(parsedRow => !region || parsedRow.country === region)
    .reduce(
      (current, accum) => ({
        state: undefined,
        country: undefined,
        confirmed: accum.confirmed + current.confirmed,
        deaths: accum.deaths + current.deaths,
        recovered: accum.recovered + current.recovered,
        lastUpdatedDate:
          moment.utc(current.lastUpdatedDate).unix() > moment.utc(accum.lastUpdatedDate).unix()
            ? current.lastUpdatedDate
            : accum.lastUpdatedDate,
        reportingDate: date,
      }),
      {
        confirmed: 0,
        deaths: 0,
        recovered: 0,
        lastUpdatedDate: initialDate,
        reportingDate: undefined,
        country: undefined,
        state: undefined,
      },
    );
  if (sum.confirmed || sum.deaths || sum.recovered) {
    return sum;
  }
};

export const extractCSV = (
  data: neatCsv.Row[],
  results: { [regionCode: string]: Record[] },
  date: string,
  initialDate: string,
): void => {
  const parsedData = data.map(
    (row): Record => {
      return {
        state: row['﻿Province/State'] || row['Province/State'] || row['Province_State'],
        country: row['Country/Region'] || row['Country_Region'],
        lastUpdatedDate: toIsoDate(row['Last Update']) || toIsoDate(row['Last_Update']),
        reportingDate: date,
        confirmed: row['Confirmed'] ? parseInt(row['Confirmed'], 10) : 0,
        deaths: row['Deaths'] ? parseInt(row['Deaths'], 10) : 0,
        recovered: row['Recovered'] ? parseInt(row['Recovered'], 10) : 0,
      };
    },
  );

  Object.entries(regions).forEach(([region, regionCode]) => {
    const value = parsedData.find(parsedRow => parsedRow.state === region);
    if (value) {
      results[regionCode].push(value);
    }
  });

  Object.entries(countries).forEach(([country, countryCode]) => {
    const sum = getSum(parsedData, date, initialDate, country);

    if (sum) {
      results[countryCode].push(sum);
    }
  });

  const sum = getSum(parsedData, date, initialDate);

  if (sum) {
    results['global'].push(sum);
  }
};
