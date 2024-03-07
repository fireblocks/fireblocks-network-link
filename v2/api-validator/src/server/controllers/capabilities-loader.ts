import fs from 'fs';
import path from 'path';
import config from '../../config';
import logger from '../../logging';

const log = logger('capabilities-loader');

export function loadCapabilitiesJson(filename: string) {
  if (!config.get('mockServerCapabilitiesDir')) {
    return;
  }

  const filePath = path.join(config.get('mockServerCapabilitiesDir'), filename);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    log.info('Loaded capabilities from preset', { count: data.length, filePath });
    return data;
  } else {
    log.warn('Missing capabilities file. Data will be randomly generated', { filePath });
  }
}
