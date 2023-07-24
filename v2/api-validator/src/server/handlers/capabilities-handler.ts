import { Capabilities } from '../../client/generated';
import logger from '../../logging';

const log = logger('handler:capabilities');

const CAPABILITIES: Capabilities = {
  version: '0.0.1',
  components: {
    accounts: '*',
    balances: '*',
    historicBalances: '*',
    transfers: '*',
    transfersBlockchain: '*',
    transfersFiat: '*',
    transfersPeerAccounts: '*',
    trading: '*',
    liquidity: '*',
    subscriptions: '*',
  },
};

export async function getCapabilities(): Promise<Capabilities> {
  log.info('GetCapabilities');

  return CAPABILITIES;
}
