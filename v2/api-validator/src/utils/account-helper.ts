import { Account } from '../client/generated';
import _ from 'lodash';

export function isParentAccount(
  childAccountId: string,
  parentAccountId: string,
  accountGetter: (accountId: string) => Account | undefined,
  maxDepth?: number
): boolean | undefined {
  const child = accountGetter(childAccountId);
  const parent = accountGetter(parentAccountId);
  if (child === undefined || parent === undefined) {
    return undefined;
  } else if (child.parentId === undefined || (maxDepth !== undefined && maxDepth <= 0)) {
    return false;
  } else if (child.parentId === parentAccountId) {
    return true;
  } else {
    const newMaxDepth = maxDepth !== undefined ? maxDepth - 1 : undefined;
    return isParentAccount(child.parentId, parentAccountId, accountGetter, newMaxDepth);
  }
}
