import { Account, ErrorType } from '../../src/client/generated';
import Client from '../../src/client';

export async function isFoundInAccountDetails(accountId: string): Promise<boolean> {
  try {
    const client = new Client();
    const account = (await client.accounts.getAccountDetails({
      accountId,
    })) as Account;
    if (!account || account.id !== accountId) {
      return false;
    }
    return true;
  } catch (err) {
    if ((err as any).body?.errorType === ErrorType.NOT_FOUND) {
      return false;
    }
    throw err;
  }
}
