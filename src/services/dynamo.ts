import AWS from 'aws-sdk';
import { Stats } from '../types/stats';

AWS.config.update({ region: 'ap-southeast-2' });
const TABLE_NAME = 'au-covid-spider-prod';
const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

export const getStatsByRegionCode = async (regionCode: string): Promise<Stats | undefined> => {
  const params = {
    TableName: TABLE_NAME,
    Key: { regionCode: regionCode },
  };

  try {
    const data = await docClient.get(params).promise();
    if (data && data.Item) {
      return JSON.parse(data.Item.stats) as Stats;
    } else return undefined;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const upsertStats = async (regionCode: string, stats: Stats) => {
  var params = {
    TableName: TABLE_NAME,
    Item: {
      regionCode: regionCode,
      stats: JSON.stringify(stats),
    },
  };

  try {
    await docClient.put(params).promise();
  } catch (error) {
    console.log(error);
    throw error;
  }
};
