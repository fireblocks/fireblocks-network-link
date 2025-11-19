import Client from '../../src/client';
import { Account } from '../../src/client/generated';
import { isFoundInAccountDetails } from './account-validation';

describe('Accounts', () => {
  let client: Client;

  beforeAll(async () => {
    client = new Client();
  });

  describe('/accounts', () => {

    describe('Without balances', () => {
      let accountsResponse: { accounts: Account[] };

      beforeAll(async () => {
        accountsResponse = await client.accounts.getAccounts({});
      });

      it('should exclude balances in each account response by default', () => {
        for (const account of accountsResponse.accounts) {
          expect(account.balances).toBeUndefined();
        }
      });

      it('should find each account in response on account details endpoint', async () => {
        for (const account of accountsResponse.accounts) {
          const found = await isFoundInAccountDetails(account.id);
          expect(found).toBe(true);
        }
      });
    });

    describe('With balances', () => {
      let balanceExcludedResponse: { accounts: Account[] };

      beforeAll(async () => {
        balanceExcludedResponse = await client.accounts.getAccounts({
          balances: true,
        });
      });

      it('should respond with accounts balances', () => {
        for (const account of balanceExcludedResponse.accounts) {
          expect(account.balances).toBeDefined();
        }
      });
    });
  });

  describe('/accounts/:accountId', () => {
    let accountId: string;

    beforeAll(async () => {
      const accountsResponse = await client.accounts.getAccounts({});
      accountId = accountsResponse.accounts?.[0]?.id;
    });

    it('should have at least one account from accounts response', () => {
      expect(accountId).toBeDefined();
    });

    describe('Default request', () => {
      let accountDetailsWithBalances: Account;

      beforeAll(async () => {
        accountDetailsWithBalances = await client.accounts.getAccountDetails({
          accountId,
        });
      });

      it('should not have account balances in response', () => {
        expect(accountDetailsWithBalances.balances).toBeUndefined();
      });
    });

    describe('With balances', () => {
      let accountDetailsWithoutBalances: Account;

      beforeAll(async () => {
        accountDetailsWithoutBalances = await client.accounts.getAccountDetails({
          accountId,
          balances: true,
        });
      });

      it('should have account balances in response', () => {
        expect(accountDetailsWithoutBalances.balances).toBeDefined();
      });
    });
  });
});
