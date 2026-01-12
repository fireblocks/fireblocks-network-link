import {
  AssetDefinition,
  AssetReference,
  CryptocurrencySymbol,
  NationalCurrencyCode,
} from '../../client/generated';
import { XComError } from '../../error';
import { fakeSchemaObject } from '../../schemas';
import { Repository } from './repository';
import { loadCapabilitiesJson } from './capabilities-loader';

export class UnknownAdditionalAssetError extends XComError {
  constructor() {
    super('assetId does not reference a known additional asset');
  }
}

const ADDITIONAL_ASSETS_COUNT = 20;

export class AssetsController {
  private static readonly repository = new Repository<AssetDefinition>();
  private static assetsLoaded = false;

  public static loadAdditionalAssets(): void {
    if (AssetsController.assetsLoaded) {
      return;
    }

    const assets =
      loadCapabilitiesJson<AssetDefinition>('assets.json') ??
      AssetsController.generateAdditionalAssets();

    for (const asset of assets) {
      AssetsController.repository.create(asset);
    }

    AssetsController.assetsLoaded = true;
  }

  private static generateAdditionalAssets() {
    const assets: AssetDefinition[] = [];

    for (let i = 0; i < ADDITIONAL_ASSETS_COUNT; i++) {
      assets.push(fakeSchemaObject('AssetDefinition') as AssetDefinition);
    }

    return assets;
  }

  public static getAllAdditionalAssets(): AssetDefinition[] {
    return AssetsController.repository.list();
  }

  public static getAdditionalAsset(assetId: string): AssetDefinition | undefined {
    return AssetsController.repository.find(assetId);
  }

  public static isKnownAdditionalAsset(assetId: string): boolean {
    return !!AssetsController.repository.find(assetId);
  }

  public static isKnownAsset(asset: AssetReference): boolean {
    if ('assetId' in asset) {
      return AssetsController.isKnownAdditionalAsset(asset.assetId);
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
