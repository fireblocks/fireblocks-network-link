import fs from 'fs';
import path from 'path';
import config from '../../config';
import logger from '../../logging';

const log = logger('capabilities-loader');

export function loadCapabilitiesJson<T = unknown>(filename: string): T[] | undefined {
  if (!config.get('mockServerCapabilitiesDir')) {
    return undefined;
  }

  const filePath = path.join(config.get('mockServerCapabilitiesDir'), filename);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8')) as T[];
    log.info('Loaded capabilities from preset', { count: data.length, filePath });
    return data;
  } else {
    log.warn('Missing capabilities file. Data will be randomly generated', { filePath });
  }

  return undefined;
}
