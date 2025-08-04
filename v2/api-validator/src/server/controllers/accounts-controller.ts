import {
  Account,
  AssetBalance,
  AssetCreditBalance,
  Balances,
  CryptocurrencySymbol,
  NationalCurrencyCode,
  AccountRate,
  AssetCode,
} from '../../client/generated';
import { fakeSchemaObject } from '../../schemas';
import { Repository } from './repository';
import { AssetsController } from './assets-controller';
import { XComError } from '../../error';
import { JSONSchemaFaker } from 'json-schema-faker';
import { isParentAccount } from '../../utils/account-helper';
import { createAssetReference } from '../../utils/asset-helper';
import { loadCapabilitiesJson } from './capabilities-loader';
import { hasCapability } from '../../../tests/utils/capable-accounts';

const SUB_ACCOUNT_COUNT = 10;

export class AccountNotExistError extends XComError {
  constructor() {
    super('Account does not exist');
  }
}

export class AccountsController {
  private static readonly repository = new Repository<Account>();
  private static accountsLoaded = false;

  public static loadAccounts(): void {
    if (this.accountsLoaded) {
      return;
    }

    const accounts = loadCapabilitiesJson('accounts.json') ?? AccountsController.generateAccounts();

    for (const account of accounts) {
      AccountsController.repository.create(account);
    }

    AccountsController.accountsLoaded = true;
  }

  private static generateAccounts(): Account[] {
    const accounts: Account[] = [];

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

      accounts.push(account);
    }

    return accounts;
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

  public static getAccountRate(
    accountId: string,
    baseAsset: AssetCode,
    quoteAsset: AssetCode,
    isTest: boolean
  ): AccountRate {
    // Check if account exists
    const account = AccountsController.getSubAccount(accountId);
    if (!account) {
      throw new AccountNotExistError();
    }

    const accountRate = fakeSchemaObject('AccountRate') as AccountRate;

    // Use the helper function to create asset references
    accountRate.baseAsset = createAssetReference(baseAsset, isTest);
    accountRate.quoteAsset = createAssetReference(quoteAsset, isTest);
    return accountRate;
  }
}

function getEveryAssetBalances(knownAdditionalAssetIds: string[]) {
  const balances: Balances = [];

  const hasCollateralCapability = hasCapability('collateral');

  const balance = !hasCollateralCapability
    ? (fakeSchemaObject('AssetBalance') as AssetBalance)
    : (fakeSchemaObject('AssetCreditBalance') as AssetCreditBalance);

  for (const assetId of knownAdditionalAssetIds) {
    balance.asset = { assetId };
    balances.push(balance);
  }

  for (const cryptocurrencySymbol of Object.values(CryptocurrencySymbol)) {
    balance.asset = { cryptocurrencySymbol };
    balances.push(balance);
  }

  for (const nationalCurrencyCode of Object.values(NationalCurrencyCode)) {
    balance.asset = { nationalCurrencyCode };
    balances.push(balance);
  }

  return balances;
}
