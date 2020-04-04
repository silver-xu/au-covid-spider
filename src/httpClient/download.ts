import fetch from 'node-fetch';
import unzipper from 'unzipper';

import { config } from '../config';

export const downloadData = async (): Promise<void> => {
  console.log('[Info]: Downloading John Hopkins Datasets from github...');
  const res = await fetch(config.dataDownloadUrl);
  await new Promise((resolve, reject) => {
    res.body.pipe(unzipper.Extract({ path: config.dataRepoPath }));

    res.body.on('error', (err) => {
      reject(err);
    });
    res.body.on('finish', function () {
      console.log('[Info]: John Hopkins Datasets successfully downloaded and unzipped');
      resolve();
    });
  });
};
