import { Capabilities } from '../../client/generated';
import logger from '../../logging';

const log = logger('handler:capabilities');

export async function handleGetCapabilities(): Promise<Capabilities> {
  log.info('GetCapabilities');

  return {
    version: '0.0.1',
    components: {
      accounts: '*',
      balances: '*',
    },
  };
}
