import { Account } from '../../client/generated';

export function getPartialAccountByQuery(
  accounts: Account[],
  properties: string[] | undefined
): Partial<Account>[] {
  if (!properties) {
    return accounts;
  }
  return accounts.map((account) => {
    const partialAccount = { id: account.id };
    for (const property of properties) {
      partialAccount[property] = account[property];
    }
    return partialAccount;
  });
}
