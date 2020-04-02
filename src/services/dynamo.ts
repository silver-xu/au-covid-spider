import AWS from 'aws-sdk';

import { Stats } from '../types/stats';
import { default as regions } from '../config/regions.json';

const STATS_TABLE_NAME = 'au-covid-spider-prod';
const SYS_TABLE_NAME = 'au-covid-spider-sys-prod';

AWS.config.update({ region: 'ap-southeast-2' });
const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

export const upsertStats = async (regionCode: string, stats: Stats): Promise<void> => {
  const shortRegionCode = regionCode.replace('AU-', '');
  const region = regions[regionCode];

  const {
    totalConfirmedCases,
    newlyConfirmedCases,
    totalDeaths,
    newDeaths,
    totalRecoveredCases,
    newlyRecoveredCases,
    history,
  } = stats;

  const params = {
    TableName: STATS_TABLE_NAME,
    Item: {
      regionCode: shortRegionCode,
      region,
      totalConfirmedCases,
      newlyConfirmedCases,
      totalDeaths,
      newDeaths,
      totalRecoveredCases,
      newlyRecoveredCases,
      history: JSON.stringify(history),
      updatedDate: new Date().toISOString(),
    },
  };

  try {
    await docClient.put(params).promise();
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const upsertLastRefreshDate = async (): Promise<void> => {
  const params = {
    TableName: SYS_TABLE_NAME,
    Item: {
      key: 'LastRefreshDate',
      value: new Date().toISOString(),
    },
  };

  try {
    await docClient.put(params).promise();
  } catch (error) {
    console.log(error);
    throw error;
  }
};
