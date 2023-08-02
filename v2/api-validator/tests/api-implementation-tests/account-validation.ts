import { ApiError, GeneralError } from '../../src/client/generated';
import Client from '../../src/client';

export async function isFoundInAccountDetails(accountId: string): Promise<boolean> {
  try {
    const client = new Client();
    const account = await client.accounts.getAccountDetails({ accountId });
    return account?.id === accountId;
  } catch (err) {
    if (err instanceof ApiError && err.body?.errorType === GeneralError.errorType.NOT_FOUND) {
      return false;
    }
    throw err;
  }
}
