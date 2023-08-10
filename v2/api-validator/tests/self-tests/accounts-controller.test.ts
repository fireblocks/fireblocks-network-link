import { Account, AccountStatus } from '../../src/client/generated';
import { AccountsController } from '../../src/server/controllers/accounts-controller';

describe('Accounts Controller', () => {
  beforeAll(() => {
    AccountsController.generateAccounts();
  });

  describe('Omit balances from account', () => {
    const account: Account = {
      id: '',
      status: AccountStatus.ACTIVE,
      title: '',
      balances: [],
    };

    let accountWithoutBalances: Account;

    beforeAll(() => {
      accountWithoutBalances = AccountsController.omitBalancesFromAccount(account);
    });

    it('should remove balance property from account object', () => {
      expect(accountWithoutBalances.balances).toBeUndefined();
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

    let accountsWithoutBalances: Account[];

    beforeAll(() => {
      accountsWithoutBalances = AccountsController.omitBalancesFromAccountList(accounts);
    });

    it('should remove balances property from every item in array', () => {
      for (const account of accountsWithoutBalances) {
        expect(account.balances).toBeUndefined();
      }
    });
  });
});
