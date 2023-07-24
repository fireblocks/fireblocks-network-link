import { Account, AccountStatus } from '../../src/client/generated';
import {
  omitBalancesFromAccount,
  omitBalancesFromAccountList,
} from '../../src/server/controllers/accounts-controller';

describe('Accounts Controller', () => {
  describe('Omit balances from account', () => {
    const account: Account = {
      id: '',
      status: AccountStatus.ACTIVE,
      title: '',
      balances: [],
    };

    beforeAll(() => {
      omitBalancesFromAccount(account);
    });

    it('should remove balance property from account object', () => {
      expect(account.balances).toBeUndefined();
    });
  });

  describe('Omit balances from account list', () => {
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
      omitBalancesFromAccountList(accounts);
    });

    it('should remove balances property from every item in array', () => {
      for (const account of accounts) {
        expect(account.balances).toBeUndefined();
      }
    });
  });
});
