import {
  AccountsController,
  AccountNotExistError,
} from '../../src/server/controllers/accounts-controller';
import { CryptocurrencySymbol, NationalCurrencyCode } from '../../src/client/generated';

describe('AccountsController', () => {
  beforeEach(() => {
    // Load accounts before each test
    AccountsController.loadAccounts();
  });

  describe('getAccountRate', () => {
    let validAccountId: string;

    beforeEach(() => {
      // Get a valid account ID for testing
      const accounts = AccountsController.getAllSubAccounts();
      validAccountId = accounts[0]?.id;
    });

    it('should return account rate for valid account with national currencies', () => {
      const accountRate = AccountsController.getAccountRate(
        validAccountId,
        NationalCurrencyCode.USD,
        NationalCurrencyCode.EUR,
        false
      );

      expect(accountRate).toBeDefined();
      expect(accountRate.rate).toBeDefined();
      expect(accountRate.baseAsset).toBeDefined();
      expect(accountRate.quoteAsset).toBeDefined();
      expect(parseFloat(accountRate.rate)).toBeGreaterThan(0);
      expect(accountRate.baseAsset).toEqual({
        nationalCurrencyCode: NationalCurrencyCode.USD,
        testAsset: false,
      });
      expect(accountRate.quoteAsset).toEqual({
        nationalCurrencyCode: NationalCurrencyCode.EUR,
        testAsset: false,
      });
    });

    it('should return account rate for valid account with cryptocurrency and national currency', () => {
      const accountRate = AccountsController.getAccountRate(
        validAccountId,
        CryptocurrencySymbol.BTC,
        NationalCurrencyCode.USD,
        true
      );

      expect(accountRate).toBeDefined();
      expect(accountRate.rate).toBeDefined();
      expect(accountRate.baseAsset).toBeDefined();
      expect(accountRate.quoteAsset).toBeDefined();
      expect(parseFloat(accountRate.rate)).toBeGreaterThan(0);
      expect(accountRate.baseAsset).toEqual({
        cryptocurrencySymbol: CryptocurrencySymbol.BTC,
        testAsset: true,
      });
      expect(accountRate.quoteAsset).toEqual({
        nationalCurrencyCode: NationalCurrencyCode.USD,
        testAsset: true,
      });
    });

    it('should return account rate for valid account with custom asset codes', () => {
      const customBaseAsset = 'CUSTOM_BASE';
      const customQuoteAsset = 'CUSTOM_QUOTE';

      const accountRate = AccountsController.getAccountRate(
        validAccountId,
        customBaseAsset,
        customQuoteAsset,
        false
      );

      expect(accountRate).toBeDefined();
      expect(accountRate.rate).toBeDefined();
      expect(accountRate.baseAsset).toBeDefined();
      expect(accountRate.quoteAsset).toBeDefined();
      expect(parseFloat(accountRate.rate)).toBeGreaterThan(0);
      expect(accountRate.baseAsset).toEqual({ assetId: customBaseAsset, testAsset: false });
      expect(accountRate.quoteAsset).toEqual({ assetId: customQuoteAsset, testAsset: false });
    });

    it('should throw AccountNotExistError for non-existent account', () => {
      const nonExistentAccountId = 'non-existent-account-id';

      expect(() => {
        AccountsController.getAccountRate(
          nonExistentAccountId,
          NationalCurrencyCode.USD,
          NationalCurrencyCode.EUR,
          false
        );
      }).toThrow(AccountNotExistError);
    });
  });
});
