import { ResponseSchemaValidator } from '../../src/client/response-schema-validator';

describe('ResponseSchemaValidator with UNIX-timestamp-epoch format', () => {
  let validator: ResponseSchemaValidator;

  beforeAll(async () => {
    validator = new ResponseSchemaValidator();
  });

  describe('Rates API response schema validation using mock data', () => {
    it('should validate valid rates response with UNIX-timestamp-epoch format', async () => {
      const validResponse = {
        rate: '1.25',
        timestamp: 1609459200, // Valid UNIX timestamp (January 1, 2021)
      };

      const validation = await validator.validate(
        'GET',
        '/accounts/{accountId}/rate',
        validResponse
      );

      // The validation should pass
      expect(validation.success).toBe(true);
      expect(validation.error).toBeUndefined();
    });

    it('should reject response with negative timestamp', async () => {
      const invalidResponse = {
        rate: '1.25',
        timestamp: -1, // Invalid: negative timestamp
      };

      const validation = await validator.validate(
        'GET',
        '/accounts/{accountId}/rate',
        invalidResponse
      );

      // Should fail validation due to invalid timestamp format
      expect(validation.success).toBe(false);
      expect(validation.error).toBeDefined();
      expect(validation.error?.keyword).toBe('format');
    });

    it('should reject response with zero timestamp', async () => {
      const invalidResponse = {
        rate: '1.25',
        timestamp: 0, // Invalid: zero timestamp
      };

      const validation = await validator.validate(
        'GET',
        '/accounts/{accountId}/rate',
        invalidResponse
      );

      // Should fail validation due to invalid timestamp format
      expect(validation.success).toBe(false);
      expect(validation.error).toBeDefined();
      expect(validation.error?.keyword).toBe('format');
    });

    it('should reject response with decimal timestamp', async () => {
      const invalidResponse = {
        rate: '1.25',
        timestamp: 1609459200.5, // Invalid: decimal timestamp
      };

      const validation = await validator.validate(
        'GET',
        '/accounts/{accountId}/rate',
        invalidResponse
      );

      // Should fail validation due to invalid timestamp format
      expect(validation.success).toBe(false);
      expect(validation.error).toBeDefined();
      expect(validation.error?.keyword).toBe('format');
    });

    it('should reject response with string timestamp', async () => {
      const invalidResponse = {
        rate: '1.25',
        timestamp: '1609459200', // Invalid: string instead of number
      };

      const validation = await validator.validate(
        'GET',
        '/accounts/{accountId}/rate',
        invalidResponse
      );

      // Should fail validation due to wrong type
      expect(validation.success).toBe(false);
      expect(validation.error).toBeDefined();
      expect(validation.error?.keyword).toBe('type');
    });

    it('should accept various valid UNIX-timestamp-epoch values', async () => {
      const validTimestamps = [
        1, // smallest positive integer
        1609459200, // January 1, 2021 00:00:00 UTC
        1696118400, // October 1, 2023 00:00:00 UTC
        2147483647, // max 32-bit signed integer
        4294967295, // max 32-bit unsigned integer
      ];

      for (const timestamp of validTimestamps) {
        const validResponse = {
          rate: '1.25',
          timestamp: timestamp,
        };

        const validation = await validator.validate(
          'GET',
          '/accounts/{accountId}/rate',
          validResponse
        );

        // Should pass validation
        expect(validation.success).toBe(true);
        expect(validation.error).toBeUndefined();
      }
    });

    it('should validate response structure completely', async () => {
      const validResponse = {
        rate: '45000.00',
        timestamp: 1696118400,
      };

      const validation = await validator.validate(
        'GET',
        '/accounts/{accountId}/rate',
        validResponse
      );

      expect(validation.success).toBe(true);
      expect(validation.error).toBeUndefined();
    });
  });
});
