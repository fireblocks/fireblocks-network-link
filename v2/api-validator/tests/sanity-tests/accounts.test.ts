import ApiClient from '../../src/client';
import { Account, AccountStatus } from '../../src/client/generated';

describe('Accounts sanity tests', () => {
  const client = new ApiClient();

  describe('getAccounts', () => {
    let accounts: Account[];

    beforeAll(async () => {
      const accountsResponse = await client.accounts.getAccounts({});
      accounts = accountsResponse.accounts;
    });

    it('should return at least one account', () => {
      expect(accounts.length).toBeGreaterThan(0);
    });

    it('should return at least one active account', () => {
      expect(accounts).toContainEqual(expect.objectContaining({ status: AccountStatus.ACTIVE }));
    });

    it('should return accounts with unique IDs', () => {
      expect(findNotUnique(accounts.map((x) => x.id))).toBeEmpty();
    });
  });
});

function findNotUnique<T>(arr: T[]): T[] {
  return arr.filter((element, i) => arr.indexOf(element) !== i);
}
