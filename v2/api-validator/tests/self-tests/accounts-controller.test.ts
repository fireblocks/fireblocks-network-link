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
        NationalCurrencyCode.EUR
      );

      expect(accountRate).toBeDefined();
      expect(accountRate.rate).toBeDefined();
      expect(accountRate.baseAsset).toBeDefined();
      expect(accountRate.quoteAsset).toBeDefined();
      expect(parseFloat(accountRate.rate)).toBeGreaterThan(0);
      expect(accountRate.baseAsset).toEqual({ nationalCurrencyCode: NationalCurrencyCode.USD });
      expect(accountRate.quoteAsset).toEqual({ nationalCurrencyCode: NationalCurrencyCode.EUR });
    });

    it('should return account rate for valid account with cryptocurrency and national currency', () => {
      const accountRate = AccountsController.getAccountRate(
        validAccountId,
        CryptocurrencySymbol.BTC,
        NationalCurrencyCode.USD
      );

      expect(accountRate).toBeDefined();
      expect(accountRate.rate).toBeDefined();
      expect(accountRate.baseAsset).toBeDefined();
      expect(accountRate.quoteAsset).toBeDefined();
      expect(parseFloat(accountRate.rate)).toBeGreaterThan(0);
      expect(accountRate.baseAsset).toEqual({ cryptocurrencySymbol: CryptocurrencySymbol.BTC });
      expect(accountRate.quoteAsset).toEqual({ nationalCurrencyCode: NationalCurrencyCode.USD });
    });

    it('should return account rate for valid account with custom asset codes', () => {
      const customBaseAsset = 'CUSTOM_BASE';
      const customQuoteAsset = 'CUSTOM_QUOTE';

      const accountRate = AccountsController.getAccountRate(
        validAccountId,
        customBaseAsset,
        customQuoteAsset
      );

      expect(accountRate).toBeDefined();
      expect(accountRate.rate).toBeDefined();
      expect(accountRate.baseAsset).toBeDefined();
      expect(accountRate.quoteAsset).toBeDefined();
      expect(parseFloat(accountRate.rate)).toBeGreaterThan(0);
      expect(accountRate.baseAsset).toEqual({ assetId: customBaseAsset });
      expect(accountRate.quoteAsset).toEqual({ assetId: customQuoteAsset });
    });

    it('should throw AccountNotExistError for non-existent account', () => {
      const nonExistentAccountId = 'non-existent-account-id';

      expect(() => {
        AccountsController.getAccountRate(
          nonExistentAccountId,
          NationalCurrencyCode.USD,
          NationalCurrencyCode.EUR
        );
      }).toThrow(AccountNotExistError);
    });
  });
});
