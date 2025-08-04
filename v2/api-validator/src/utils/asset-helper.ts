import {
  AssetReference,
  AssetCode,
  CryptocurrencySymbol,
  NationalCurrencyCode,
  NationalCurrency,
  NativeCryptocurrency,
  OtherAssetReference,
} from '../client/generated';

/**
 * Creates an AssetReference from an AssetCode value
 * @param assetCode - The asset code to convert
 * @returns AssetReference object with the appropriate type
 */
export function createAssetReference(assetCode: AssetCode): AssetReference {
  // Check if it's a NationalCurrencyCode
  if (Object.values(NationalCurrencyCode).includes(assetCode as NationalCurrencyCode)) {
    return { nationalCurrencyCode: assetCode as NationalCurrencyCode } as NationalCurrency;
  }

  // Check if it's a CryptocurrencySymbol
  if (Object.values(CryptocurrencySymbol).includes(assetCode as CryptocurrencySymbol)) {
    return { cryptocurrencySymbol: assetCode as CryptocurrencySymbol } as NativeCryptocurrency;
  }

  // Otherwise treat as custom asset ID
  return { assetId: assetCode as string } as OtherAssetReference;
}
