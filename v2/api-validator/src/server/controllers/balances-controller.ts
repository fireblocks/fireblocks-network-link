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
import { accountsController } from './accounts-controller';

export class InvalidAssetQueryCombinationError extends XComError {
  constructor() {
    super('assetId, nationalCurrencyCode and cryptocurrencySymbol can not be used in conjunction');
  }
}

export function getSubAccountBalances(accountId: string): Balances {
  return accountsController.getSubAccount(accountId)?.balances ?? [];
}

export function getSingleAssetBalance(accountId: string, asset: AssetReference): Balances {
  const accountBalances = getSubAccountBalances(accountId);

  const assetBalance = accountBalances.find((balance) => _.isMatch(balance.asset, asset));

  if (!assetBalance) {
    return [];
  }

  return [assetBalance];
}

function isUpToOneParameterDefined(...params) {
  return params.filter((param) => !!param).length <= 1;
}

export function validateAssetQueryParams(
  assetId: string | undefined,
  nationalCurrencyCode: NationalCurrencyCode | undefined,
  cryptocurrencySymbol: Layer1Cryptocurrency | Layer2Cryptocurrency | undefined
): void {
  if (!isUpToOneParameterDefined(assetId, nationalCurrencyCode, cryptocurrencySymbol)) {
    throw new InvalidAssetQueryCombinationError();
  }
  if (assetId && !assetsController.isKnownAdditionalAsset(assetId)) {
    throw new UnknownAdditionalAssetError();
  }
}
