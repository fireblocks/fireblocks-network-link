import 'ts-node/register';
import Client from '../../src/client';

async function preloadCapabilities() {
  const client = new Client();
  global['capabilities'] = await client.capabilities.getCapabilities({});
}

module.exports = preloadCapabilities;
