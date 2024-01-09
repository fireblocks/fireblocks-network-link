import ApiClient from '../../src/client';
import { Pageable, paginated } from './pagination';
import {
  AssetDefinition,
  AssetReference,
  CryptocurrencySymbol,
  NationalCurrencyCode,
} from '../../src/client/generated';

/**
 * Answers questions about the assets supported by the server.
 */
export class AssetsDirectory {
  public static async fetch(): Promise<AssetsDirectory> {
    const client = new ApiClient();
    const assets: AssetDefinition[] = [];

    const getAdditionalAssets: Pageable<AssetDefinition> = async (limit, startingAfter?) => {
      const response = await client.capabilities.getAdditionalAssets({ limit, startingAfter });
      return response.assets;
    };

    for await (const asset of paginated(getAdditionalAssets)) {
      assets.push(asset);
    }

    return new AssetsDirectory(assets);
  }

  constructor(private readonly assets: AssetDefinition[]) {}

  public isKnownAdditionalAsset(assetId: string): boolean {
    return this.assets.some((x) => x.id === assetId);
  }

  public isKnownAsset(asset: AssetReference): boolean {
    if ('assetId' in asset) {
      return this.isKnownAdditionalAsset(asset.assetId);
    }
    if ('cryptocurrencySymbol' in asset) {
      return !!CryptocurrencySymbol[asset.cryptocurrencySymbol];
    }
    if ('nationalCurrencyCode' in asset) {
      return !!NationalCurrencyCode[asset.nationalCurrencyCode];
    }
    return false;
  }
}
