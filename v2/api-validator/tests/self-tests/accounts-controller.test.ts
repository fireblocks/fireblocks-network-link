import {
  AccountsController,
  AccountNotExistError,
  RateBadRequestError,
} from '../../src/server/controllers/accounts-controller';

describe('AccountsController', () => {
  beforeEach(() => {
    // Load accounts before each test
    AccountsController.loadAccounts();
  });

  describe('getRateByPairId', () => {
    let validAccountId: string;

    beforeEach(() => {
      // Get a valid account ID for testing
      const accounts = AccountsController.getAllSubAccounts();
      validAccountId = accounts[0]?.id;
    });

    it('should return rate for valid account with valid pair ID', () => {
      const pairId = 'USD-EUR';
      const rate = AccountsController.getRateByPairId(validAccountId, pairId, 'conversion');

      expect(rate).toBeDefined();
      expect(rate.rate).toBeDefined();
      expect(rate.timestamp).toBeDefined();
      expect(parseFloat(rate.rate)).toBeGreaterThan(0);
      expect(typeof rate.timestamp).toBe('number');
    });

    it('should return rate for valid account with cryptocurrency pair ID', () => {
      const pairId = 'BTC-USD';
      const rate = AccountsController.getRateByPairId(validAccountId, pairId, 'conversion');

      expect(rate).toBeDefined();
      expect(rate.rate).toBeDefined();
      expect(rate.timestamp).toBeDefined();
      expect(parseFloat(rate.rate)).toBeGreaterThan(0);
      expect(typeof rate.timestamp).toBe('number');
    });

    it('should return rate for valid account with custom pair ID', () => {
      const pairId = 'CUSTOM_BASE-CUSTOM_QUOTE';
      const rate = AccountsController.getRateByPairId(validAccountId, pairId, 'conversion');

      expect(rate).toBeDefined();
      expect(rate.rate).toBeDefined();
      expect(rate.timestamp).toBeDefined();
      expect(parseFloat(rate.rate)).toBeGreaterThan(0);
      expect(typeof rate.timestamp).toBe('number');
    });

    it('should return different rates for different pair types', () => {
      const pairId = 'USD-EUR';

      const conversionRate = AccountsController.getRateByPairId(
        validAccountId,
        pairId,
        'conversion'
      );
      const rampsRate = AccountsController.getRateByPairId(validAccountId, pairId, 'ramps');
      const orderBookRate = AccountsController.getRateByPairId(validAccountId, pairId, 'orderBook');

      expect(conversionRate.rate).toBe('1.25');
      expect(rampsRate.rate).toBe('45000.00');
      expect(orderBookRate.rate).toBe('0.85');
    });

    it('should throw AccountNotExistError for non-existent account', () => {
      const nonExistentAccountId = 'non-existent-account-id';
      const pairId = 'USD-EUR';

      expect(() => {
        AccountsController.getRateByPairId(nonExistentAccountId, pairId, 'conversion');
      }).toThrow(AccountNotExistError);
    });

    it('should throw RateBadRequestError for empty pair ID', () => {
      const emptyPairId = '';

      expect(() => {
        AccountsController.getRateByPairId(validAccountId, emptyPairId, 'conversion');
      }).toThrow(RateBadRequestError);
    });

    it('should throw RateBadRequestError for undefined pair ID', () => {
      expect(() => {
        AccountsController.getRateByPairId(validAccountId, undefined as any, 'conversion');
      }).toThrow(RateBadRequestError);
    });
  });
});
