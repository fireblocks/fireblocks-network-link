import { Account, AccountStatus } from '../../client/generated';

export const ACCOUNTS: Account[] = [
  { id: '1', balances: [], status: AccountStatus.ACTIVE, title: '', description: '' },
  { id: '2', balances: [], status: AccountStatus.INACTIVE, title: '', description: '' },
  { id: '3', balances: [], status: AccountStatus.ACTIVE, title: '', description: '' },
  { id: '4', balances: [], status: AccountStatus.ACTIVE, title: '', description: '' },
  { id: '5', balances: [], status: AccountStatus.ACTIVE, title: '', description: '' },
];

export function getSubAccount(accountId: string): Account | undefined {
  return ACCOUNTS.find((account) => account.id === accountId);
}

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
