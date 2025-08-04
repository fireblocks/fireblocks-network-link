import {
  AssetReference,
  AssetCode,
  CryptocurrencySymbol,
  NationalCurrencyCode,
} from '../client/generated';

/**
 * Type guard to check if an AssetCode is a NationalCurrencyCode
 */
function isNationalCurrencyCode(assetCode: AssetCode): assetCode is NationalCurrencyCode {
  return Object.values(NationalCurrencyCode).includes(assetCode as NationalCurrencyCode);
}

/**
 * Type guard to check if an AssetCode is a CryptocurrencySymbol
 */
function isCryptocurrencySymbol(assetCode: AssetCode): assetCode is CryptocurrencySymbol {
  return Object.values(CryptocurrencySymbol).includes(assetCode as CryptocurrencySymbol);
}

/**
 * Creates an AssetReference from an AssetCode value
 * @param assetCode - The asset code to convert
 * @returns AssetReference object with the appropriate type
 */
export function createAssetReference(assetCode: AssetCode): AssetReference {
  if (isNationalCurrencyCode(assetCode)) {
    return { nationalCurrencyCode: assetCode };
  }

  if (isCryptocurrencySymbol(assetCode)) {
    return { cryptocurrencySymbol: assetCode };
  }

  // Otherwise treat as custom asset ID
  return { assetId: assetCode };
}
