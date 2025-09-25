import Ajv from 'ajv';
import addFormats from 'ajv-formats';

describe('UNIX-timestamp-epoch format validation', () => {
  let ajv: Ajv;

  beforeAll(() => {
    // Set up AJV with the custom UNIX-timestamp-epoch format (same as in ResponseSchemaValidator)
    ajv = new Ajv({ strictSchema: false });
    addFormats(ajv);

    ajv.addFormat("UNIX-timestamp-epoch", {
      type: "number",
      validate: (timestamp) => {
        return Number.isInteger(timestamp) && timestamp > 0;
      }
    });
  });

  describe('Valid positive timestamps', () => {
    const validTimestamps = [
      { value: 1, description: 'smallest positive integer' },
      { value: 1609459200, description: 'January 1, 2021 00:00:00 UTC' },
      { value: 1696118400, description: 'October 1, 2023 00:00:00 UTC' },
      { value: 2147483647, description: 'max 32-bit signed integer (2038-01-19)' },
      { value: 4294967295, description: 'max 32-bit unsigned integer (2106-02-07)' },
      { value: Number.MAX_SAFE_INTEGER, description: 'largest safe integer' }
    ];

    validTimestamps.forEach(({ value, description }) => {
      it(`should accept ${description} (${value})`, () => {
        const schema = {
          type: "object",
          properties: {
            timestamp: {
              type: "number",
              format: "UNIX-timestamp-epoch"
            }
          },
          required: ["timestamp"]
        };

        const validate = ajv.compile(schema);
        const result = validate({ timestamp: value });

        expect(result).toBe(true);
        expect(validate.errors).toBeNull();
      });
    });
  });

  describe('Invalid negative timestamps', () => {
    const invalidTimestamps = [
      { value: -1, description: 'negative one' },
      { value: -1609459200, description: 'negative timestamp' },
      { value: -2147483648, description: 'min 32-bit signed integer' },
      { value: Number.MIN_SAFE_INTEGER, description: 'smallest safe integer' }
    ];

    invalidTimestamps.forEach(({ value, description }) => {
      it(`should reject ${description} (${value})`, () => {
        const schema = {
          type: "object",
          properties: {
            timestamp: {
              type: "number",
              format: "UNIX-timestamp-epoch"
            }
          },
          required: ["timestamp"]
        };

        const validate = ajv.compile(schema);
        const result = validate({ timestamp: value });

        expect(result).toBe(false);
        expect(validate.errors).not.toBeNull();
        expect(validate.errors?.[0]?.message).toContain('format');
      });
    });
  });

  describe('Invalid zero and non-integer values', () => {
    const invalidFormatValues = [
      { value: 0, description: 'zero', expectedErrorType: 'format' },
      { value: 1609459200.5, description: 'decimal timestamp', expectedErrorType: 'format' },
      { value: Math.PI, description: 'PI', expectedErrorType: 'format' }
    ];

    invalidFormatValues.forEach(({ value, description, expectedErrorType }) => {
      it(`should reject ${description} (${value})`, () => {
        const schema = {
          type: "object",
          properties: {
            timestamp: {
              type: "number",
              format: "UNIX-timestamp-epoch"
            }
          },
          required: ["timestamp"]
        };

        const validate = ajv.compile(schema);
        const result = validate({ timestamp: value });

        expect(result).toBe(false);
        expect(validate.errors).not.toBeNull();
        expect(validate.errors?.[0]?.message).toContain(expectedErrorType);
      });
    });

    // Special cases: NaN, Infinity, -Infinity are rejected by AJV as invalid numbers before format validation
    const invalidNumberValues = [
      { value: NaN, description: 'NaN' },
      { value: Infinity, description: 'Infinity' },
      { value: -Infinity, description: 'negative Infinity' }
    ];

    invalidNumberValues.forEach(({ value, description }) => {
      it(`should reject ${description} (${value})`, () => {
        const schema = {
          type: "object",
          properties: {
            timestamp: {
              type: "number",
              format: "UNIX-timestamp-epoch"
            }
          },
          required: ["timestamp"]
        };

        const validate = ajv.compile(schema);
        const result = validate({ timestamp: value });

        expect(result).toBe(false);
        expect(validate.errors).not.toBeNull();
        // These values fail type validation before format validation
        expect(validate.errors?.[0]?.message).toContain('number');
      });
    });
  });

  describe('Type validation', () => {
    const nonNumberValues = [
      { value: "1609459200", description: 'string number' },
      { value: "not-a-number", description: 'string text' },
      { value: null, description: 'null' },
      { value: undefined, description: 'undefined' },
      { value: [], description: 'empty array' },
      { value: {}, description: 'empty object' },
      { value: true, description: 'boolean true' },
      { value: false, description: 'boolean false' }
    ];

    nonNumberValues.forEach(({ value, description }) => {
      it(`should reject ${description} (${JSON.stringify(value)})`, () => {
        const schema = {
          type: "object",
          properties: {
            timestamp: {
              type: "number",
              format: "UNIX-timestamp-epoch"
            }
          },
          required: ["timestamp"]
        };

        const validate = ajv.compile(schema);
        const result = validate({ timestamp: value });

        expect(result).toBe(false);
        expect(validate.errors).not.toBeNull();
        
        // undefined fails required validation, others fail type validation
        if (value === undefined) {
          expect(validate.errors?.[0]?.keyword).toBe('required');
        } else {
          expect(validate.errors?.[0]?.keyword).toBe('type');
        }
      });
    });
  });

  describe('Edge cases', () => {
    it('should work correctly with optional timestamp field', () => {
      const schema = {
        type: "object",
        properties: {
          timestamp: {
            type: "number",
            format: "UNIX-timestamp-epoch"
          }
        }
        // timestamp is not required
      };

      const validate = ajv.compile(schema);
      
      // Should pass when field is missing
      expect(validate({})).toBe(true);
      
      // Should pass with valid timestamp
      expect(validate({ timestamp: 1609459200 })).toBe(true);
      
      // Should fail with invalid timestamp
      expect(validate({ timestamp: -1 })).toBe(false);
    });

    it('should work in array context', () => {
      const schema = {
        type: "object",
        properties: {
          timestamps: {
            type: "array",
            items: {
              type: "number",
              format: "UNIX-timestamp-epoch"
            }
          }
        },
        required: ["timestamps"]
      };

      const validate = ajv.compile(schema);
      
      // Valid array
      expect(validate({ timestamps: [1609459200, 1609545600, 1609632000] })).toBe(true);
      
      // Array with negative timestamp should fail
      expect(validate({ timestamps: [1609459200, -1, 1609632000] })).toBe(false);
    });
  });
});
