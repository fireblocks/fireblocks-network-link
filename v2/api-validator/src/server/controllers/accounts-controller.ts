import { Account } from '../../client/generated';
import { ACCOUNTS } from '../handlers/account-handlers';

export function isKnownSubAccount(accountId: string): boolean {
  return ACCOUNTS.some((account) => account.id === accountId);
}

export function omitBalancesFromAccountList(accounts: Account[]): Account[] {
  return accounts.map((account) => omitBalancesFromAccount(account));
}

export function omitBalancesFromAccount(account: Account): Account {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { balances, ...accountWithoutBalances } = account;
  return accountWithoutBalances;
}
