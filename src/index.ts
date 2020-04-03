import util from 'util';
import rmfr from 'rmfr';
import fs from 'fs';
import moment from 'moment';
import neatCsv from 'neat-csv';

import { config } from './config';
import { asyncForEach } from './utils';
import { extractCSV } from './csv/csvParser';
import { Record } from './types/record';
import { mapToStats } from './mapper/mapToStats';
import { downloadData } from './httpClient/download';

import { default as regions } from './config/regions.json';
import { default as countries } from './config/countries.json';
import { upsertStats, upsertLastRefreshDate } from './services/dynamo';

const { dataRepoPath } = config;
const dataDir = 'COVID-19-master/csse_covid_19_data/csse_covid_19_daily_reports';

const exists = util.promisify(fs.exists);
const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);

export const handler = async () => {
  // if (await exists(`${dataRepoPath}/COVID-19-master`)) {
  //   console.log('[Info]: Data folder not empty, delete!');
  //   await rmfr(`${dataRepoPath}/COVID-19-master`);
  //   console.log('[Info]: Previous data folder deleted');
  // }

  // await downloadData();

  const results: { [regionCode: string]: Record[] } = {};
  Object.values(regions).forEach(regionCode => {
    results[regionCode] = [] as Record[];
  });
  Object.values(countries).forEach(regionCode => {
    results[regionCode] = [] as Record[];
  });
  results['global'] = [] as Record[];

  const allFiles = await readdir(`${dataRepoPath}/${dataDir}/`);
  const csvFiles = allFiles.filter(allFile => allFile.endsWith('.csv'));

  const initialDate = moment.utc(csvFiles.sort()[0].replace('.csv', ''), 'MM-DD-YYYY').toISOString();

  const tasks = csvFiles.map(async csvFile => {
    const filePath = `${dataRepoPath}/${dataDir}/${csvFile}`;
    const date = moment.utc(csvFile.replace('.csv', ''), 'MM-DD-YYYY').toISOString();

    const content = await readFile(filePath);
    const data = await neatCsv(content);

    extractCSV(data, results, date, initialDate);
  });

  await asyncForEach(tasks, async task => {
    await task;
  });

  const stats = mapToStats(results);
  console.log('[Info]: CSV have been parsed and transformed');
  console.log('[Info]: Refreshing data source');
  const upsertTasks = Object.entries(stats).map(async ([regionCode, regionStats]) => {
    await upsertStats(regionCode, regionStats);
  });

  await Promise.all(upsertTasks);
  await upsertLastRefreshDate();
  console.log('[Info]: Data source refresh completed');
  console.log('[Info]: All Done!');

  return true;
};

if (!process.env.LAMBDA_ENV) {
  handler();
}
