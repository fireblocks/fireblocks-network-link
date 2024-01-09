import {
  AssetDefinition,
  AssetReference,
  CryptocurrencySymbol,
  NationalCurrencyCode,
} from '../../client/generated';
import { XComError } from '../../error';
import { fakeSchemaObject } from '../../schemas';
import { Repository } from './repository';

export class UnknownAdditionalAssetError extends XComError {
  constructor() {
    super('assetId does not reference a known additional asset');
  }
}

const ADDITIONAL_ASSETS_COUNT = 20;

export class AssetsController {
  private static readonly repository = new Repository<AssetDefinition>();
  private static assetsLoaded = false;

  public static generateAdditionalAssets(): void {
    if (this.assetsLoaded) {
      return;
    }

    for (let i = 0; i < ADDITIONAL_ASSETS_COUNT; i++) {
      this.repository.create(fakeSchemaObject('AssetDefinition') as AssetDefinition);
    }
    this.assetsLoaded = true;
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
