import { createAssetReference } from '../../src/utils/asset-helper';
import { CryptocurrencySymbol, NationalCurrencyCode } from '../../src/client/generated';

describe('Asset Helper', () => {
  describe('createAssetReference', () => {
    it('should create NationalCurrency reference for NationalCurrencyCode', () => {
      const result = createAssetReference(NationalCurrencyCode.USD);

      expect(result).toHaveProperty('nationalCurrencyCode');
      expect((result as any).nationalCurrencyCode).toBe(NationalCurrencyCode.USD);
    });

    it('should create NativeCryptocurrency reference for CryptocurrencySymbol', () => {
      const result = createAssetReference(CryptocurrencySymbol.BTC);

      expect(result).toHaveProperty('cryptocurrencySymbol');
      expect((result as any).cryptocurrencySymbol).toBe(CryptocurrencySymbol.BTC);
    });

    it('should create OtherAssetReference for custom asset ID', () => {
      const customAssetId = 'CUSTOM_ASSET_123';
      const result = createAssetReference(customAssetId);

      expect(result).toHaveProperty('assetId');
      expect((result as any).assetId).toBe(customAssetId);
    });

    it('should handle string values that match enum values', () => {
      const usdString = 'USD' as any;
      const result = createAssetReference(usdString);

      expect(result).toHaveProperty('nationalCurrencyCode');
      expect((result as any).nationalCurrencyCode).toBe('USD');
    });

    it('should handle string values that match cryptocurrency symbols', () => {
      const btcString = 'BTC' as any;
      const result = createAssetReference(btcString);

      expect(result).toHaveProperty('cryptocurrencySymbol');
      expect((result as any).cryptocurrencySymbol).toBe('BTC');
    });
  });
});
