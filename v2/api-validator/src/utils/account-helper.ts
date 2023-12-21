import { Account } from '../client/generated';

export function isParentAccount(
  childAccountId: string,
  parentAccountId: string,
  accountGetter: (accountId: string) => Account | undefined
): boolean | undefined {
  const child = accountGetter(childAccountId);
  const parent = accountGetter(parentAccountId);
  if (child === undefined || parent === undefined) {
    return undefined;
  } else if (child.parentId === undefined) {
    return false;
  } else if (child.parentId === parentAccountId) {
    return true;
  } else {
    return isParentAccount(child.parentId, parentAccountId, accountGetter);
  }
}
