import { isParentAccount } from '../../src/utils/account-helper';
import { Account } from '../../src/client/generated';
import { fakeSchemaObject } from '../../src/schemas';

describe('Account helper tests', () => {
  const accounts = new Map<string, Account>();
  const childAccountId = 'childId';
  const child = fakeSchemaObject('Account') as Account;
  child.id = childAccountId;
  const parentAccountId = 'parentId';
  const parent = fakeSchemaObject('Account') as Account;
  parent.id = parentAccountId;
  const middleAccountId = 'middleId';
  const middle = fakeSchemaObject('Account') as Account;
  middle.id = middleAccountId;

  beforeEach(async () => {
    accounts.clear();
  });

  it('should return true when child account is a direct descendant of the parent', () => {
    const childWithParent = { ...child };
    childWithParent.parentId = parentAccountId;
    accounts.set(childAccountId, childWithParent);
    accounts.set(parentAccountId, parent);

    const result = isParentAccount(childAccountId, parentAccountId, accounts.get.bind(accounts));
    expect(result).toBeTrue();
    const resultWithMaxDepth1 = isParentAccount(
      childAccountId,
      parentAccountId,
      accounts.get.bind(accounts),
      1
    );
    expect(resultWithMaxDepth1).toBeTrue();
  });

  it('should return true when child account is a non direct descendant of the parent, only if the maxDepth allows it', () => {
    const childWithParent = { ...child };
    childWithParent.parentId = middleAccountId;
    accounts.set(childAccountId, childWithParent);
    const middleWithParent = { ...middle };
    middleWithParent.parentId = parentAccountId;
    accounts.set(middleAccountId, middleWithParent);
    accounts.set(parentAccountId, parent);

    const resultNonDirectParent = isParentAccount(
      childAccountId,
      parentAccountId,
      accounts.get.bind(accounts)
    );
    expect(resultNonDirectParent).toBeTrue();
    const resultDirectParent = isParentAccount(
      childAccountId,
      parentAccountId,
      accounts.get.bind(accounts),
      1
    );
    expect(resultDirectParent).toBeFalse();
  });

  it('should return false when child account is not a descendant of the parent', () => {
    const childWithParent = { ...child };
    childWithParent.parentId = middleAccountId;
    accounts.set(childAccountId, childWithParent);
    const middleWithParent = { ...middle };
    middleWithParent.parentId = undefined;
    accounts.set(middleAccountId, middleWithParent);
    accounts.set(parentAccountId, parent);

    const result = isParentAccount(childAccountId, parentAccountId, accounts.get.bind(accounts));
    expect(result).toBeFalse();
    const resultWithMaxDepth1 = isParentAccount(
      childAccountId,
      parentAccountId,
      accounts.get.bind(accounts),
      1
    );
    expect(resultWithMaxDepth1).toBeFalse();
  });

  it.each([
    {
      idType: 'childId',
      accountId: childAccountId,
      account: child,
    },
    {
      idType: 'parentId',
      accountId: parentAccountId,
      account: parent,
    },
  ])(
    'should return undefined when $idType not exists',
    ({ accountId: accountId, account: account }) => {
      accounts.set(accountId, account);

      expect(
        isParentAccount(childAccountId, parentAccountId, accounts.get.bind(accounts))
      ).toBeUndefined();
    }
  );
});
