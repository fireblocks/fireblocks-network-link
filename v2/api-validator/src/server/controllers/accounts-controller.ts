import { Account } from '../../client/generated';

export function omitBalancesFromAccountList(accounts: Account[]): void {
  for (let i = 0; i < accounts.length; i++) {
    omitBalancesFromAccount(accounts[i]);
  }
}

export function omitBalancesFromAccount(account: Account): void {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { balances, ...accountWithoutBalances } = account;
  account = accountWithoutBalances;
}
