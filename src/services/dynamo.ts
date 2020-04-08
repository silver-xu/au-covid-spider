import AWS from 'aws-sdk';

import { Stats } from '../types/stats';

const STATS_TABLE_NAME = 'au-covid-spider-prod';
const SYS_TABLE_NAME = 'au-covid-spider-sys-prod';

AWS.config.update({ region: 'ap-southeast-2' });
const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

export const upsertStats = async (regionCode: string, stats: Stats): Promise<void> => {
  const {
    totalConfirmedCases,
    newlyConfirmedCases,
    totalDeaths,
    newDeaths,
    totalRecoveredCases,
    newlyRecoveredCases,
    currentConfirmedCases,
    netNewlyConfirmedCases,
    history,
  } = stats;

  const params = {
    TableName: STATS_TABLE_NAME,
    Item: {
      regionCode,
      totalConfirmedCases,
      newlyConfirmedCases,
      totalDeaths,
      newDeaths,
      totalRecoveredCases,
      currentConfirmedCases,
      netNewlyConfirmedCases,
      newlyRecoveredCases,
      history: JSON.stringify(history),
      lastUpdatedDate: new Date().toISOString(),
    },
  };

  let success = false;
  let timeout = 0;
  while (!success) {
    try {
      await new Promise((resolve, reject) =>
        setTimeout(async () => {
          try {
            await docClient.put(params).promise();
            resolve();
          } catch (error) {
            reject(error);
          }
        }, timeout * 1000),
      );
      success = true;
      console.log(`[Info]: Upsert ${regionCode} successfully.`);
    } catch (error) {
      console.log(error);
      timeout = Math.random() * 300;

      console.log(`[Info]: Because of the exception, retry will happen ${timeout} secs later.`);
    }
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
