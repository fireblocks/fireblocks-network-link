import { Account, AccountStatus } from '../../src/client/generated';
import { excludeBalances } from '../../src/server/controllers/accounts-controller';

describe('Accounts Controller', () => {
  describe('Exclude Balances', () => {
    const accounts: Account[] = [
      {
        id: '',
        status: AccountStatus.ACTIVE,
        title: '',
        balances: [],
      },
      {
        id: '',
        status: AccountStatus.ACTIVE,
        title: '',
        balances: [],
      },
    ];

    beforeAll(() => {
      excludeBalances(accounts);
    });

    it('should remove balances property from every item in array', () => {
      for (const account of accounts) {
        expect(account.balances).toBeUndefined();
      }
    });
  });
});
