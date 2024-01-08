import {
  Account,
  AssetBalance,
  Balances,
  CryptocurrencySymbol,
  NationalCurrencyCode,
} from '../../client/generated';
import { fakeSchemaObject } from '../../schemas';
import { Repository } from './repository';
import { AssetsController } from './assets-controller';
import { XComError } from '../../error';
import { JSONSchemaFaker } from 'json-schema-faker';
import { isParentAccount } from '../../utils/account-helper';

const SUB_ACCOUNT_COUNT = 10;

export class AccountNotExistError extends XComError {
  constructor() {
    super('Account does not exist');
  }
}

export class AccountsController {
  private static readonly repository = new Repository<Account>();
  private static accountsLoaded = false;

  public static generateAccounts(): void {
    if (this.accountsLoaded) {
      return;
    }

    for (let i = 0; i < SUB_ACCOUNT_COUNT; i++) {
      const knownAssetIds = AssetsController.getAllAdditionalAssets().map((a) => a.id);
      const balances = getEveryAssetBalances(knownAssetIds);
      const account = fakeSchemaObject('Account') as Account;
      if (account.parentId !== undefined) {
        const parent = JSONSchemaFaker.random.pick(AccountsController.repository.list()) as Account;
        if (parent === undefined) {
          account.parentId = undefined;
        } else {
          account.parentId = parent.id;
        }
      }
      account.balances = balances;
      AccountsController.repository.create(account);
    }
    this.accountsLoaded = true;
  }

  public static getAllSubAccounts(): Account[] {
    return AccountsController.repository.list();
  }

  public static getSubAccount(accountId: string): Account | undefined {
    return AccountsController.repository.find(accountId);
  }

  public static isKnownSubAccount(accountId: string): boolean {
    return !!AccountsController.repository.find(accountId);
  }

  public static isParentAccount(
    childAccountId: string,
    parentAccountId: string,
    maxDepth?: number
  ): boolean {
    const result = isParentAccount(
      childAccountId,
      parentAccountId,
      AccountsController.getSubAccount,
      maxDepth
    );
    if (result === undefined) {
      throw new AccountNotExistError();
    }
    return result;
  }
}

function getEveryAssetBalances(knownAdditionalAssetIds: string[]) {
  const balances: Balances = [];

  for (const assetId of knownAdditionalAssetIds) {
    const balance = fakeSchemaObject('AssetBalance') as AssetBalance;
    balance.asset = { assetId };
    balances.push(balance);
  }

  for (const cryptocurrencySymbol of Object.values(CryptocurrencySymbol)) {
    const balance = fakeSchemaObject('AssetBalance') as AssetBalance;
    balance.asset = { cryptocurrencySymbol };
    balances.push(balance);
  }

  for (const nationalCurrencyCode of Object.values(NationalCurrencyCode)) {
    const balance = fakeSchemaObject('AssetBalance') as AssetBalance;
    balance.asset = { nationalCurrencyCode };
    balances.push(balance);
  }

  return balances;
}
