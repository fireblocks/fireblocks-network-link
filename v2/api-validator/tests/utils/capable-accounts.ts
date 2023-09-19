import ApiClient from '../../src/client';
import { AccountStatus, ApiComponents } from '../../src/client/generated';

export function hasCapability(component: keyof ApiComponents): boolean {
  const accountId = findCapableAccountId(component);
  return accountId != null;
}

/**
 * Returns ID of an account supporting the specified API component.
 * Throws if such an account does not exist.
 */
export function getCapableAccountId(component: keyof ApiComponents): string {
  const accountId = findCapableAccountId(component);
  if (accountId == null) {
    throw new Error(`No ${component} capability`);
  }
  return accountId;
}

/**
 * Returns ID of an account supporting the specified API component.
 * Returns undefined if such an account does not exist.
 */
export function findCapableAccountId(component: keyof ApiComponents): string | undefined {
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

/**
 * Returns IDs of all the accounts supporting the specified API component.
 * Returns an empty array if such accounts do not exist.
 */
export function getAllCapableAccountIds(component: keyof ApiComponents): string[] {
  const capability = ApiClient.getCachedApiComponents()[component];
  if (!capability) {
    return [];
  }
  if (capability === '*') {
    return getAllActiveAccountIds();
  }

  if (!Array.isArray(capability)) {
    throw new Error('Unexpected capability value: ' + capability);
  }

  return capability.filter((accountId) => isActiveAccount(accountId));
}

function getAllActiveAccountIds(): string[] {
  return ApiClient.getCachedAccounts()
    .filter((a) => a.status === AccountStatus.ACTIVE)
    .map((a) => a.id);
}

function isActiveAccount(accountId: string): boolean {
  for (const account of ApiClient.getCachedAccounts()) {
    if (account.id === accountId) {
      return account.status === AccountStatus.ACTIVE;
    }
  }
  return false;
}
