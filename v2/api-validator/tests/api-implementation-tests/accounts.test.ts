import Client from '../../src/client';
import { Account, ErrorType } from '../../src/client/generated';

describe('Accounts', () => {
  let client: Client;

  beforeAll(() => {
    client = new Client();
  });

  describe('/accounts', () => {
    let result: { accounts: Account[] };

    beforeAll(async () => {
      result = (await client.accounts.getAccounts({})) as { accounts: Account[] };
    });

    it('should include balances in each account response by default', () => {
      for (const account of result.accounts) {
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
      const isFoundInAccountDetails = async (accountId: string): Promise<boolean> => {
        try {
          const account = (await client.accounts.getAccountDetails({
            accountId,
          })) as Account;
          if (!account || account.id !== accountId) {
            return false;
          }
          return true;
        } catch (err) {
          if ((err as any).body?.errorType === ErrorType.NOT_FOUND) {
            return false;
          }
          throw err;
        }
      };

      it('should find each account in response on account details endpoint', async () => {
        for (const asset of result.accounts) {
          const found = await isFoundInAccountDetails(asset.id);
          expect(found).toBe(true);
        }
      });
    });
  });
});
