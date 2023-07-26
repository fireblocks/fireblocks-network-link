import {
  AssetReference,
  Layer1Cryptocurrency,
  Layer2Cryptocurrency,
  NationalCurrencyCode,
} from '../../client/generated';
import { SUPPORTED_ASSETS } from '../handlers/additional-assets-handler';

export function isKnownAdditionalAsset(assetId: string): boolean {
  return SUPPORTED_ASSETS.some((x) => x.id === assetId);
}

export function isKnownAsset(asset: AssetReference): boolean {
  if ('assetId' in asset) {
    return isKnownAdditionalAsset(asset.assetId);
  }
  if ('cryptocurrencySymbol' in asset) {
    return (
      !!Layer1Cryptocurrency[asset.cryptocurrencySymbol] ||
      !!Layer2Cryptocurrency[asset.cryptocurrencySymbol]
    );
  }
  if ('nationalCurrencyCode' in asset) {
    return !!NationalCurrencyCode[asset.nationalCurrencyCode];
  }
  return false;
}
