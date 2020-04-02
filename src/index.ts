import Bottleneck from 'bottleneck';

import { config } from './config';
import { default as regions } from './config/regions.json';
import { fetchStats } from './httpClient/statsClient';
import { upsertStats, upsertLastRefreshDate } from './services/dynamo';

import fetch from 'node-fetch';
import csv from 'csv-parser';
import fs from 'fs';
import rmfr from 'rmfr';
import util from 'util';
import unzipper from 'unzipper';
import fstream from 'fstream';

const exists = util.promisify(fs.exists);
const dataRepoPath = '/tmp';
const repoUrl = 'https://github.com/CSSEGISandData/COVID-19/archive/master.zip';

const downloadData = async () => {
  console.log('[Info]: Downloading John Hopkins Datasets from github');
  const res = await fetch(repoUrl);
  await new Promise((resolve, reject) => {
    res.body.pipe(unzipper.Extract({ path: dataRepoPath }));

    res.body.on('error', err => {
      reject(err);
    });
    res.body.on('finish', function() {
      console.log('[Info]: John Hopkins Datasets successfully downloaded and unzipped');
      resolve();
    });
  });
};

export const handler = async () => {
  if (await exists(`${dataRepoPath}/COVID-19-master`)) {
    console.log('[Info]: Data folder not empty, delete!');
    await rmfr(`${dataRepoPath}/COVID-19-master`);
    console.log('[Info]: Previous data folder deleted');
  }

  await downloadData();

  const results = [];

  fs.createReadStream(`${dataRepoPath}/COVID-19-master/csse_covid_19_data/csse_covid_19_daily_reports/01-22-2020.csv`)
    .pipe(csv())
    .on('data', data => results.push(data))
    .on('end', () => {
      console.log(results);
    });
};

if (!process.env.LAMBDA_ENV) {
  handler();
}
