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

const SUB_ACCOUNT_COUNT = 10;
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
