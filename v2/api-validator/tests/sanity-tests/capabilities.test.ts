import ApiClient from '../../src/client';
import { Capabilities } from '../../src/client/generated';

const KNOWN_API_VERSIONS = ['0.2.0'];

describe('Capabilities', () => {
  const client = new ApiClient();

  describe('getCapabilities', () => {
    let capabilities: Capabilities;

    beforeAll(async () => {
      capabilities = await client.capabilities.getCapabilities({});
    });

    it('should implement a supported API version', () => {
      expect(isSupportedApiVersion(capabilities.version)).toBe(true);
    });

    it('should always have accounts capability', () => {
      expect(capabilities.components.accounts).not.toBeEmpty();
    });

    it('should always have balances capability', () => {
      expect(capabilities.components.balances).not.toBeEmpty();
    });

    describe('accounts mentioned in capabilities should exist in the accounts list', () => {
      const components = [
        'accounts',
        'balances',
        'historicBalances',
        'transfers',
        'transfersBlockchain',
        'transfersFiat',
        'transfersPeerAccounts',
        'trading',
        'liquidity',
      ];

      let accountIds: string[];

      beforeAll(async () => {
        const accountsResponse = await client.accounts.getAccounts({});
        accountIds = accountsResponse.accounts.map((acc) => acc.id);
      });

      it.each(components)(
        'all accounts supporting %s should appear in the accounts list',
        (component) => {
          const capableAccounts = capabilities.components[component];
          if (capableAccounts && capableAccounts !== '*') {
            for (const accountId of capableAccounts) {
              expect(accountIds).toContain(accountId);
            }
          }
        }
      );
    });
  });
});

function isSupportedApiVersion(apiVersion: string) {
  return KNOWN_API_VERSIONS.includes(apiVersion);
}
