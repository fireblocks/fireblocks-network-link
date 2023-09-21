import 'ts-node/register';
import ApiClient from '../../src/client';

async function preloadCapabilities() {
  const client = new ApiClient();
  await client.cacheCapabilities();
}

module.exports = preloadCapabilities;
