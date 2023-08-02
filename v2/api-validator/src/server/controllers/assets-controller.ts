import {
  AssetDefinition,
  AssetReference,
  Blockchain,
  BucketAsset,
  Erc20Token,
  Layer1Cryptocurrency,
  Layer2Cryptocurrency,
  NationalCurrencyCode,
  StellarToken,
} from '../../client/generated';
import { XComError } from '../../error';

export const SUPPORTED_ASSETS: AssetDefinition[] = [
  {
    id: '360de0ad-9ba1-45d5-8074-22453f193d65',
    type: Erc20Token.type.ERC20TOKEN,
    blockchain: Blockchain.ETHEREUM,
    contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    name: 'USDC',
    symbol: 'USDC',
    description:
      'USDC is a fully collateralized US Dollar stablecoin developed by CENTRE, the open source project with Circle being the first of several forthcoming issuers.',
    decimalPlaces: 6,
  },
  {
    id: '606bce6b-ff15-4704-9390-b9e32a6cfcff',
    type: Erc20Token.type.ERC20TOKEN,
    blockchain: Blockchain.POLYGON_PO_S,
    contractAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    name: 'USDC',
    symbol: 'USDC',
    description:
      'USD Coin is an ERC-20 stablecoin brought to you by Circle and Coinbase. It is issued by regulated and licensed financial institutions that maintain full reserves of the equivalent fiat currency.',
    decimalPlaces: 6,
  },
  {
    id: '4386cf4d-83b2-4410-96da-0d3919a45506',
    type: StellarToken.type.STELLAR_TOKEN,
    blockchain: Blockchain.STELLAR,
    issuerAddress: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
    stellarCurrencyCode: 'USDC',
    name: 'USDC',
    symbol: 'USDC',
    description:
      'USDC is a fully collateralized US Dollar stablecoin, based on the open source fiat stablecoin framework developed by Centre.',
    decimalPlaces: 2,
  },
  {
    id: 'f0844d82-7097-4521-95bc-d843724a893e',
    type: BucketAsset.type.BUCKET_ASSET,
    name: 'USDC',
    symbol: 'USDC',
    description: 'Aggregation of all USDC token over the different blockchains.',
    decimalPlaces: 6,
  },
];

export class UnknownAdditionalAssetError extends XComError {
  constructor() {
    super('assetId does not reference a known additional asset');
  }
}

export function getSupportedAsset(assetId: string): AssetDefinition | undefined {
  return SUPPORTED_ASSETS.find((asset) => asset.id === assetId);
}

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
