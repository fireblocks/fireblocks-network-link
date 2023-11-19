import 'ts-node/register';
import { writeFileSync } from 'fs';
import ApiClient from '../../src/client';

async function preloadCapabilities() {
  const client = new ApiClient();
  await client.cacheCapabilities();

  writeFileSync('capabilities.json', JSON.stringify(ApiClient.getCachedApiComponents()));
  writeFileSync('accounts.json', JSON.stringify(ApiClient.getCachedAccounts()));
}

module.exports = preloadCapabilities;
