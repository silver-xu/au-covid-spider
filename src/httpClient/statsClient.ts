import fetch from 'node-fetch';

import { Stats } from '../types/stats';
import { mapStats } from '../mapper/mapStats';

const { SMARTABLE_API_KEY } = process.env;

export const fetchStats = async (statsApiEndpoint: string, regionCode: string): Promise<Stats> => {
  try {
    const resp = await fetch(statsApiEndpoint + regionCode, {
      headers: {
        'Subscription-Key': SMARTABLE_API_KEY,
      },
    });

    if (!resp.ok) {
      throw new Error(resp.statusText);
    }

    const statsResponse = await resp.json();
    return mapStats(statsResponse);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
