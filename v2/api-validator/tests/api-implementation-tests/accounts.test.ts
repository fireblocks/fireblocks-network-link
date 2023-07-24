import Client from '../../src/client';
import { Account } from '../../src/client/generated';
import { isFoundInAccountDetails } from './utils';

describe('Accounts', () => {
  let client: Client;
  let accountsResponse: { accounts: Account[] };

  beforeAll(async () => {
    client = new Client();
    accountsResponse = (await client.accounts.getAccounts({})) as { accounts: Account[] };
  });

  describe('/accounts', () => {
    it('should include balances in each account response by default', () => {
      for (const account of accountsResponse.accounts) {
        expect(account.balances).toBeDefined();
      }
    });

    describe('Excluding balances from response', () => {
      let balanceExcludedResponse: { accounts: Account[] };

      beforeAll(async () => {
        balanceExcludedResponse = (await client.accounts.getAccounts({
          excludeBalances: true,
        })) as {
          accounts: Account[];
        };
      });

      it('should respond with balance excluded', () => {
        for (const account of balanceExcludedResponse.accounts) {
          expect(account.balances).toBeUndefined();
        }
      });
    });

    describe('Interaction with /accounts/:accountId', () => {
      it('should find each account in response on account details endpoint', async () => {
        for (const account of accountsResponse.accounts) {
          const found = await isFoundInAccountDetails(account.id);
          expect(found).toBe(true);
        }
      });
    });
  });

  describe('/accounts/:accountId', () => {
    let accountId: string;

    beforeAll(() => {
      accountId = accountsResponse.accounts?.[0]?.id;
    });

    it('should have at least one account from accounts response', () => {
      expect(accountId).toBeDefined();
    });

    describe('Default request', () => {
      let accountDetailsWithBalances: Account;

      beforeAll(async () => {
        accountDetailsWithBalances = (await client.accounts.getAccountDetails({
          accountId,
        })) as Account;
      });

      it('should have balances in response', () => {
        expect(accountDetailsWithBalances.balances).toBeDefined();
      });
    });

    describe('With excludeBalances', () => {
      let accountDetailsWithoutBalances: Account;

      beforeAll(async () => {
        accountDetailsWithoutBalances = (await client.accounts.getAccountDetails({
          accountId,
          excludeBalances: true,
        })) as Account;
      });

      it('should not have balances in response', () => {
        expect(accountDetailsWithoutBalances.balances).toBeDefined();
      });
    });
  });
});
