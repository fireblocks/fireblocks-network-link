import ApiClient from '../../src/client';
import { Capabilities } from '../../src/client/generated';

describe('Capabilities', () => {
  const client = new ApiClient();

  describe('getCapabilities', () => {
    let capabilities: Capabilities;

    beforeAll(async () => {
      capabilities = await client.capabilities.getCapabilities({});
    });

    it('should specify API version', () => {
      expect(capabilities.version).not.toBeEmpty();
    });

    it('should always have accounts capability', () => {
      expect(capabilities.components.accounts).not.toBeEmpty();
    });

    it('should have balances capability if no ramps', () => {
      if (!capabilities.components.ramps) {
        expect(capabilities.components.balances).not.toBeEmpty();
      }
    });

    describe('accounts mentioned in capabilities should exist in the accounts list', () => {
      const components = [
        'accounts',
        'balances',
        'transfers',
        'transfersBlockchain',
        'transfersFiat',
        'transfersPeerAccounts',
        'liquidity',
        'ramps',
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
