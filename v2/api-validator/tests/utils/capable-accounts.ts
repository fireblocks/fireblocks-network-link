import ApiClient from '../../src/client';
import { Pageable, paginated } from './pagination';
import { Account, AccountStatus, ApiComponents } from '../../src/client/generated';

export function hasCapability(component: keyof ApiComponents): boolean {
  const accountId = findCapableAccount(component);
  return accountId != null;
}

export function getCapableAccountId(component: keyof ApiComponents): string {
  const accountId = findCapableAccount(component);
  if (accountId == null) {
    throw new Error(`No ${component} capability`);
  }
  return accountId;
}

export function findCapableAccount(component: keyof ApiComponents): string | undefined {
  const capability = ApiClient.getCachedApiComponents()[component];
  if (!capability) {
    return undefined;
  }
  if (capability === '*') {
    return getAnyActiveAccountId();
  }
  if (!Array.isArray(capability)) {
    throw new Error('Unexpected capability value: ' + capability);
  }

  for (const accountId of capability) {
    if (isActiveAccount(accountId)) {
      return accountId;
    }
  }
}

function getAnyActiveAccountId(): string | undefined {
  for (const account of ApiClient.getCachedAccounts()) {
    if (account.status === AccountStatus.ACTIVE) {
      return account.id;
    }
  }
}

function isActiveAccount(accountId: string): boolean {
  for (const account of ApiClient.getCachedAccounts()) {
    if (account.id === accountId) {
      return account.status === AccountStatus.ACTIVE;
    }
  }
  return false;
}

export async function getCapableAccounts(
  capability: '*' | string[],
  balances?: boolean
): Promise<Account[]> {
  const client = new ApiClient();

  if (Array.isArray(capability)) {
    return await getAccountsFromIdList(capability);
  }

  const getAccounts: Pageable<Account> = async (limit, startingAfter?) => {
    const response = await client.accounts.getAccounts({ limit, startingAfter, balances });
    return response.accounts;
  };

  const accounts: Account[] = [];

  for await (const account of paginated(getAccounts)) {
    accounts.push(account);
  }

  return accounts;
}

async function getAccountsFromIdList(accountIds: string[]): Promise<Account[]> {
  const client = new ApiClient();
  const accountPromises: Promise<Account>[] = [];

  for (const accountId of accountIds) {
    accountPromises.push(client.accounts.getAccountDetails({ accountId }));
  }

  return await Promise.all(accountPromises);
}
