import {
  AssetReference,
  Balances,
  CryptocurrencySymbol,
  NationalCurrencyCode,
} from '../../client/generated';
import { AssetsController, UnknownAdditionalAssetError } from './assets-controller';
import { XComError } from '../../error';
import _ from 'lodash';
import { AccountsController } from './accounts-controller';

export class InvalidAssetQueryCombinationError extends XComError {
  constructor() {
    super('assetId, nationalCurrencyCode and cryptocurrencySymbol can not be used in conjunction');
  }
}

export class BalancesController {
  constructor(private accountId: string) {}

  public getSubAccountBalances(): Balances {
    return AccountsController.getSubAccount(this.accountId)?.balances ?? [];
  }

  public getSingleAssetBalance(asset: AssetReference): Balances {
    const accountBalances = this.getSubAccountBalances();

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
    cryptocurrencySymbol: CryptocurrencySymbol | undefined
  ): void {
    if (!this.isUpToOneParameterDefined(assetId, nationalCurrencyCode, cryptocurrencySymbol)) {
      throw new InvalidAssetQueryCombinationError();
    }
    if (assetId && !AssetsController.isKnownAdditionalAsset(assetId)) {
      throw new UnknownAdditionalAssetError();
    }
  }
}
