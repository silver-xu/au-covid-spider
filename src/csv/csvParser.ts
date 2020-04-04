import moment from 'moment';
import neatCsv from 'neat-csv';

import { Record } from '../types/record';

import { default as countries } from '../config/countries.json';

const toIsoDate = (dateString: string): string =>
  moment.utc(dateString, 'M/D/YYYY HH:mm', true).toISOString() ||
  moment.utc(dateString, 'M/D/YYYY', true).toISOString() ||
  moment.utc(dateString, 'M/D/YY HH:mm', true).toISOString() ||
  moment.utc(dateString, 'M/D/YY', true).toISOString() ||
  moment.utc(dateString, moment.ISO_8601, true).toISOString();

const getSum = (
  parsedData: Record[],
  date: string,
  initialDate: string,
  country?: string,
  state?: string,
): Record | undefined => {
  const sum = parsedData
    .filter((parsedRow) => (!country || parsedRow.country === country) && (!state || parsedRow.state === state))
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
      let country = row['Country/Region'] || row['Country_Region'];

      // Correcting the political mistake John Hopkins made.
      // Taiwan is part of China!
      country = country === 'Taiwan' ? 'China' : country;

      return {
        state: row['﻿Province/State'] || row['Province/State'] || row['Province_State'],
        country,
        lastUpdatedDate: toIsoDate(row['Last Update']) || toIsoDate(row['Last_Update']),
        reportingDate: date,
        confirmed: row['Confirmed'] ? parseInt(row['Confirmed'], 10) : 0,
        deaths: row['Deaths'] ? parseInt(row['Deaths'], 10) : 0,
        recovered: row['Recovered'] ? parseInt(row['Recovered'], 10) : 0,
      };
    },
  );

  Object.entries(countries).forEach(([countryName, country]) => {
    const sum = getSum(parsedData, date, initialDate, countryName);

    if (sum) {
      results[country.code].push(sum);
    }

    if (country['states']) {
      Object.entries(country['states']).forEach(([stateName, state]) => {
        const sum = getSum(parsedData, date, initialDate, undefined, stateName);

        if (sum) {
          results[state['code']].push(sum);
        }
      });
    }
  });

  const globalSum = getSum(parsedData, date, initialDate);
  if (globalSum) {
    results['Global'].push(globalSum);
  }
};
