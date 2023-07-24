import { Account } from '../../client/generated';

export function excludeBalances(accounts: Account[]): void {
  for (let i = 0; i < accounts.length; i++) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { balances, ...accountWithoutBalances } = accounts[i];
    accounts[i] = accountWithoutBalances;
  }
}
