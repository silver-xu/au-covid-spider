import Bottleneck from 'bottleneck';

import { config } from './config';
import { default as regions } from './config/regions.json';
import { fetchStats } from './httpClient/statsClient';
import { upsertStats, upsertLastRefreshDate } from './services/dynamo';

import Git from 'nodegit';
import csv from 'csv-parser';
import fs from 'fs';
import rmfr from 'rmfr';
import util from 'util';

const readdir = util.promisify(fs.exists);

export const handler = async () => {
  if (await readdir('dataRepo')) {
    console.log('[Info]: dataRepo directory already exists');
    console.log('[Info]: Dropping dataRepo directory');
    await rmfr('dataRepo');
    console.log('[Info]: dataRepo directory dropped');
  }

  console.log('[Info]: cloning John Hopkins Datasets from github'
  await Git.Clone('https://github.com/CSSEGISandData/COVID-19.git', 'dataRepo');
  console.log('[Info]: John Hopkins Datasets cloned'

  const results = [];

  fs.createReadStream('./dataRepo/csse_covid_19_data/csse_covid_19_daily_reports/01-22-2020.csv')
    .pipe(csv())
    .on('data', data => results.push(data))
    .on('end', () => {
      console.log(results);
    });
};

if (!process.env.LAMBDA_ENV) {
  handler();
}
