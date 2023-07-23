import Client from '../../src/client';
import { Account, ErrorType } from '../../src/client/generated';

describe('Accounts', () => {
  let client: Client;

  beforeAll(() => {
    client = new Client();
  });

  describe('/accounts', () => {
    let result: { withdrawals?: Account[] };

    beforeAll(async () => {
      result = await client.accounts.getAccounts({});
      expect(result.withdrawals).toBeDefined();
    });

    describe('Interaction with /accounts/:accountId', () => {
      const isListedAccount = async (accountId: string): Promise<boolean> => {
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

      it('should find each listed asset on account details endpoint', async () => {
        for (const asset of result.withdrawals as Account[]) {
          const found = await isListedAccount(asset.id);
          expect(found).toBe(true);
        }
      });
    });
  });
});
