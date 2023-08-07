import {
  AssetReference,
  Balances,
  Layer1Cryptocurrency,
  Layer2Cryptocurrency,
  NationalCurrencyCode,
} from '../../client/generated';
import { assetsController, UnknownAdditionalAssetError } from './assets-controller';
import { XComError } from '../../error';
import _ from 'lodash';
import { AccountsController, accountsController } from './accounts-controller';

export class InvalidAssetQueryCombinationError extends XComError {
  constructor() {
    super('assetId, nationalCurrencyCode and cryptocurrencySymbol can not be used in conjunction');
  }
}

export class BalancesController {
  constructor(private accountsController: AccountsController) {}

  public getSubAccountBalances(accountId: string): Balances {
    return this.accountsController.getSubAccount(accountId)?.balances ?? [];
  }

  public getSingleAssetBalance(accountId: string, asset: AssetReference): Balances {
    const accountBalances = this.getSubAccountBalances(accountId);

    const assetBalance = accountBalances.find((balance) => _.isMatch(balance.asset, asset));

    if (!assetBalance) {
      return [];
    }

    return [assetBalance];
  }

  private isUpToOneParameterDefined(...params) {
    return params.filter((param) => !!param).length <= 1;
  }

  public validateAssetQueryParams(
    assetId: string | undefined,
    nationalCurrencyCode: NationalCurrencyCode | undefined,
    cryptocurrencySymbol: Layer1Cryptocurrency | Layer2Cryptocurrency | undefined
  ): void {
    if (!this.isUpToOneParameterDefined(assetId, nationalCurrencyCode, cryptocurrencySymbol)) {
      throw new InvalidAssetQueryCombinationError();
    }
    if (assetId && !assetsController.isKnownAdditionalAsset(assetId)) {
      throw new UnknownAdditionalAssetError();
    }
  }
}

export const balanceController = new BalancesController(accountsController);
