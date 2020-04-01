import Bottleneck from 'bottleneck';

import { config } from './config';
import { default as regions } from './config/regions.json';
import { fetchStats } from './httpClient/statsClient';
import { upsertStats } from './services/dynamo';

const API_TIMEOUT_IN_SEC = 15;

const { statsApiEndpoint } = config;
const apiLimiter = new Bottleneck({
  minTime: API_TIMEOUT_IN_SEC * 1000,
});

export const handler = async () => {
  console.log(`[Info]: Spider started with timeout of ${API_TIMEOUT_IN_SEC}...`);

  const refreshAllRegions = Object.keys(regions).map(regionCode =>
    apiLimiter.schedule(async () => {
      console.log(`[Info]: Start indexing ${regions[regionCode]}`);
      const stats = await fetchStats(statsApiEndpoint, regionCode);
      await upsertStats(regionCode, stats);
      console.log(`[Info]: Indexing ${regions[regionCode]} completed`);
      return stats;
    }),
  );

  return await Promise.all(refreshAllRegions);
  console.log('[Info]: Spider completed...');
};
