import { randomUUID } from 'crypto';
import {
  AssetReference,
  BalanceCapability,
  Balances,
  Layer1Cryptocurrency,
  Layer2Cryptocurrency,
  NationalCurrencyCode,
} from '../../client/generated';
import {
  SUPPORTED_ASSETS,
  UnknownAdditionalAssetError,
  isKnownAdditionalAsset,
} from './assets-controller';
import { ACCOUNTS } from './accounts-controller';
import { XComError } from '../../error';
import _ from 'lodash';

const capabilitiesFromSupportedAssets = SUPPORTED_ASSETS.map((asset) => ({
  asset: { assetId: asset.id },
  id: randomUUID(),
}));
const nationalCorrencyBalanceCapabilities = Object.values(NationalCurrencyCode).map(
  (nationalCurrencyCode) => ({ id: randomUUID(), asset: { nationalCurrencyCode } })
);
const cryptocurrencyBalanceCapabilities = [
  ...Object.values(Layer1Cryptocurrency),
  ...Object.values(Layer2Cryptocurrency),
].map((cryptocurrencySymbol) => ({ id: randomUUID(), asset: { cryptocurrencySymbol } }));

export const BALANCE_CAPABILITIES: BalanceCapability[] = [
  ...capabilitiesFromSupportedAssets,
  ...nationalCorrencyBalanceCapabilities,
  ...cryptocurrencyBalanceCapabilities,
];

export class InvalidAssetQueryCombinationError extends XComError {
  constructor() {
    super('assetId, nationalCurrencyCode and cryptocurrencySymbol can not be used in conjunction');
  }
}

export function getSubAccountBalances(accountId: string): Balances {
  return ACCOUNTS.find((account) => account.id === accountId)?.balances ?? [];
}

export function getSingleAssetBalance(accountId: string, asset: AssetReference): Balances {
  const accountBalances = getSubAccountBalances(accountId);

  const assetBalance = accountBalances.find((balance) => _.isEqual(balance.asset, asset));

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
  if (assetId && !isKnownAdditionalAsset(assetId)) {
    throw new UnknownAdditionalAssetError();
  }
}
