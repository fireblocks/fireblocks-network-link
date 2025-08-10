import {
  AccountsController,
  AccountNotExistError,
  RateBadRequestError,
} from '../../src/server/controllers/accounts-controller';

describe('accounts-controller.ts: get rate', () => {
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
      const pairId = '550e8400-e29b-41d4-a716-446655440000';
      const rate = AccountsController.getRateByPairId(validAccountId, pairId, 'conversion');

      expect(rate).toBeDefined();
      expect(rate.rate).toBeDefined();
      expect(rate.timestamp).toBeDefined();
      expect(parseFloat(rate.rate)).toBeGreaterThan(0);
      expect(typeof rate.timestamp).toBe('number');
    });

    it('should return rate for valid account with cryptocurrency pair ID', () => {
      const pairId = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
      const rate = AccountsController.getRateByPairId(validAccountId, pairId, 'conversion');

      expect(rate).toBeDefined();
      expect(rate.rate).toBeDefined();
      expect(rate.timestamp).toBeDefined();
      expect(parseFloat(rate.rate)).toBeGreaterThan(0);
      expect(typeof rate.timestamp).toBe('number');
    });

    it('should return rate for valid account with custom pair ID', () => {
      const pairId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';
      const rate = AccountsController.getRateByPairId(validAccountId, pairId, 'conversion');

      expect(rate).toBeDefined();
      expect(rate.rate).toBeDefined();
      expect(rate.timestamp).toBeDefined();
      expect(parseFloat(rate.rate)).toBeGreaterThan(0);
      expect(typeof rate.timestamp).toBe('number');
    });

    it('should return different rates for different pair types', () => {
      const pairId = '550e8400-e29b-41d4-a716-446655440000';

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
      const pairId = '550e8400-e29b-41d4-a716-446655440000';

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

    it('should throw RateBadRequestError for invalid pair type', () => {
      const pairId = '550e8400-e29b-41d4-a716-446655440000';

      expect(() => {
        AccountsController.getRateByPairId(validAccountId, pairId, 'invalid' as any);
      }).toThrow(RateBadRequestError);
    });

    it('should throw RateBadRequestError for undefined pair type', () => {
      const pairId = '550e8400-e29b-41d4-a716-446655440000';

      expect(() => {
        AccountsController.getRateByPairId(validAccountId, pairId, undefined as any);
      }).toThrow(RateBadRequestError);
    });
  });
});
