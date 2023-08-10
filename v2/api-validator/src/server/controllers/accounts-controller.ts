import { JSONSchemaFaker } from 'json-schema-faker';
import {
  Account,
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
      AccountsController.repository.create(fakeSchemaObject('Account') as Account);

      const knownAssetIds = AssetsController.getAllAdditionalAssets().map((a) => a.id);
      injectKnownAssetIdsToBalances(knownAssetIds, AccountsController.repository);
      removeDuplicateBalances(AccountsController.repository);
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

  public static omitBalancesFromAccountList(accounts: Account[]): Account[] {
    return accounts.map((account) => AccountsController.omitBalancesFromAccount(account));
  }

  public static omitBalancesFromAccount(account: Account): Account {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { balances, ...accountWithoutBalances } = account;
    return accountWithoutBalances;
  }
}

function injectKnownAssetIdsToBalances(
  knownAssetIds: string[],
  accountRepository: Repository<Account>
): void {
  for (const { id } of accountRepository.list()) {
    const account = accountRepository.find(id);
    if (!account) {
      throw new Error('Not possible!');
    }

    if (!account.balances) {
      continue;
    }

    for (let i = 0; i < account.balances.length; i++) {
      if ('assetId' in account.balances[i].asset) {
        account.balances[i].asset['assetId'] = JSONSchemaFaker.random.pick(knownAssetIds);
      }
    }
  }
}

function removeDuplicateBalances(accountRepository: Repository<Account>) {
  for (const { id } of accountRepository.list()) {
    const account = accountRepository.find(id);
    if (!account) {
      throw new Error('Not possible!');
    }
    const usedCryptocurrencySymbols = new Set<CryptocurrencySymbol>();
    const usedNationalCurrencyCodes = new Set<NationalCurrencyCode>();
    const usedOtherAssetReferences = new Set<string>();
    const balances = account.balances ?? [];
    const dedupedBalances: Balances = [];

    for (let i = 0; i < balances.length; i++) {
      const asset = balances[i].asset;

      if ('assetId' in asset) {
        if (usedOtherAssetReferences.has(asset.assetId)) {
          continue;
        }
        usedOtherAssetReferences.add(asset.assetId);
        dedupedBalances.push(balances[i]);
      }
      if ('cryptocurrencySymbol' in asset) {
        if (usedCryptocurrencySymbols.has(asset.cryptocurrencySymbol)) {
          continue;
        }
        usedCryptocurrencySymbols.add(asset.cryptocurrencySymbol);
        dedupedBalances.push(balances[i]);
      }
      if ('nationalCurrencyCode' in asset) {
        if (usedNationalCurrencyCodes.has(asset.nationalCurrencyCode)) {
          continue;
        }
        usedNationalCurrencyCodes.add(asset.nationalCurrencyCode);
        dedupedBalances.push(balances[i]);
      }
    }

    account.balances = dedupedBalances;
  }
}
