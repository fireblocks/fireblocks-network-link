import 'ts-node/register';
import config from '../../src/config';

async function preloadCapabilities() {
  const capabilitiesConfig = config.get('capabilities');
  global['capabilities'] = capabilitiesConfig;
}

module.exports = preloadCapabilities;
