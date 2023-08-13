import Client from '../../src/client';
import { Account } from '../../src/client/generated';
import { Pageable, paginated } from './pagination';

export async function getCapableAccounts(
  capability: '*' | string[],
  balances?: boolean
): Promise<Account[]> {
  const client = new Client();

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
  const client = new Client();
  const accountPromises: Promise<Account>[] = [];

  for (const accountId of accountIds) {
    accountPromises.push(client.accounts.getAccountDetails({ accountId }));
  }

  return await Promise.all(accountPromises);
}
