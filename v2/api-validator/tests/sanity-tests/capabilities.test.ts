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
        // 'trading',
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

    describe('requirements validation', () => {
      it('should have valid structure when requirements are present', () => {
        if (capabilities.requirements) {
          expect(capabilities.requirements).toBeDefined();
          expect(typeof capabilities.requirements).toBe('object');
        }
      });

      it('should have valid transfersBlockchain requirements when present', () => {
        if (capabilities.requirements?.transfersBlockchain) {
          const blockchainReqs = capabilities.requirements.transfersBlockchain;
          expect(blockchainReqs).toBeDefined();
          expect(typeof blockchainReqs).toBe('object');
        }
      });

      it('should have valid withdrawalAddressPolicy when present', () => {
        if (capabilities.requirements?.transfersBlockchain?.withdrawalAddressPolicy) {
          const policy = capabilities.requirements.transfersBlockchain.withdrawalAddressPolicy;
          expect(policy).toBeDefined();
          expect(policy.value).toBeDefined();
          expect(['ApprovedAddressesOnly', 'AllAddresses']).toContain(policy.value);
        }
      });

      it('should only have requirements for components that exist', () => {
        if (capabilities.requirements?.transfersBlockchain) {
          // If transfersBlockchain requirements exist, the component should also exist
          expect(capabilities.components.transfersBlockchain).toBeDefined();
        }
      });
    });
  });
});
