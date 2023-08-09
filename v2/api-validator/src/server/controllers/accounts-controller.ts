import { JSONSchemaFaker } from 'json-schema-faker';
import { Account } from '../../client/generated';
import { fakeSchemaObject } from '../../schemas';
import { Repository } from './repository';
import { AssetsController } from './assets-controller';

const SUB_ACCOUNT_COUNT = 10;
export class AccountsController {
  private static readonly repository = new Repository<Account>();

  public static init(): void {
    for (let i = 0; i < SUB_ACCOUNT_COUNT; i++) {
      AccountsController.repository.create(fakeSchemaObject('Account') as Account);

      const knownAssetIds = AssetsController.getAllAdditionalAssets().map((a) => a.id);
      injectKnownAssetIdsToBalances(knownAssetIds, AccountsController.repository);
    }
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
