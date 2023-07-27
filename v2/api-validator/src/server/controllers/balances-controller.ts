import { randomUUID } from 'crypto';
import {
  BalanceCapability,
  Balances,
  Layer1Cryptocurrency,
  Layer2Cryptocurrency,
  NationalCurrencyCode,
} from '../../client/generated';
import { SUPPORTED_ASSETS } from './assets-controller';
import { ACCOUNTS } from './accounts-controller';
import { XComError } from '../../error';

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
}
