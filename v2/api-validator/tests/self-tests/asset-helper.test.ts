import { createAssetReference } from '../../src/utils/asset-helper';
import { CryptocurrencySymbol, NationalCurrencyCode } from '../../src/client/generated';

describe('Asset Helper', () => {
  describe('createAssetReference', () => {
    it('should create NationalCurrency reference for NationalCurrencyCode', () => {
      const result = createAssetReference(NationalCurrencyCode.USD, false);

      expect(result).toHaveProperty('nationalCurrencyCode');
      expect((result as any).nationalCurrencyCode).toBe(NationalCurrencyCode.USD);
      expect((result as any).testAsset).toBe(false);
    });

    it('should create NativeCryptocurrency reference for CryptocurrencySymbol', () => {
      const result = createAssetReference(CryptocurrencySymbol.BTC, false);

      expect(result).toHaveProperty('cryptocurrencySymbol');
      expect((result as any).cryptocurrencySymbol).toBe(CryptocurrencySymbol.BTC);
      expect((result as any).testAsset).toBe(false);
    });

    it('should create OtherAssetReference for custom asset ID', () => {
      const customAssetId = 'CUSTOM_ASSET_123';
      const result = createAssetReference(customAssetId, false);

      expect(result).toHaveProperty('assetId');
      expect((result as any).assetId).toBe(customAssetId);
      expect((result as any).testAsset).toBe(false);
    });

    it('should handle string values that match enum values', () => {
      const usdString = 'USD' as any;
      const result = createAssetReference(usdString, false);

      expect(result).toHaveProperty('nationalCurrencyCode');
      expect((result as any).nationalCurrencyCode).toBe('USD');
      expect((result as any).testAsset).toBe(false);
    });

    it('should handle string values that match cryptocurrency symbols', () => {
      const btcString = 'BTC' as any;
      const result = createAssetReference(btcString, false);

      expect(result).toHaveProperty('cryptocurrencySymbol');
      expect((result as any).cryptocurrencySymbol).toBe('BTC');
      expect((result as any).testAsset).toBe(false);
    });

    it('should create test asset references when testAsset is true', () => {
      const result = createAssetReference(NationalCurrencyCode.USD, true);

      expect(result).toHaveProperty('nationalCurrencyCode');
      expect((result as any).nationalCurrencyCode).toBe(NationalCurrencyCode.USD);
      expect((result as any).testAsset).toBe(true);
    });

    it('should create test cryptocurrency references when testAsset is true', () => {
      const result = createAssetReference(CryptocurrencySymbol.BTC, true);

      expect(result).toHaveProperty('cryptocurrencySymbol');
      expect((result as any).cryptocurrencySymbol).toBe(CryptocurrencySymbol.BTC);
      expect((result as any).testAsset).toBe(true);
    });

    it('should create test custom asset references when testAsset is true', () => {
      const customAssetId = 'TEST_CUSTOM_ASSET_456';
      const result = createAssetReference(customAssetId, true);

      expect(result).toHaveProperty('assetId');
      expect((result as any).assetId).toBe(customAssetId);
      expect((result as any).testAsset).toBe(true);
    });
  });
});
