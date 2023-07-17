import { randomUUID } from 'crypto';
import { isNonceUsed, registerNonce } from '../src/server/middlewares/nonce-middleware';

describe('Nonce validation', () => {
  const apiKey = 'api-key';
  let nonce: string;
  let mapping: Map<string, Set<string>>;

  beforeEach(() => {
    nonce = randomUUID();
    mapping = new Map<string, Set<string>>();
  });

  describe('Register nonce', () => {
    it('should register successfully with empty map input', () => {
      registerNonce(apiKey, nonce, mapping);

      expect(mapping.get(apiKey)?.size).toBe(1);
      expect(mapping.get(apiKey)?.has(nonce)).toBe(true);
    });

    it('should reigster successfully with existing entry in map', () => {
      const apiNonces = new Set<string>();
      apiNonces.add(randomUUID());
      mapping.set(apiKey, apiNonces);

      registerNonce(apiKey, nonce, mapping);

      expect(mapping.get(apiKey)?.size).toBe(2);
      expect(mapping.get(apiKey)?.has(nonce)).toBe(true);
    });
  });

  describe('Check if nonce is used', () => {
    it('should return true when nonce exists in mapping', () => {
      const apiNonces = new Set<string>();
      apiNonces.add(nonce);
      mapping.set(apiKey, apiNonces);

      expect(isNonceUsed(apiKey, nonce, mapping)).toBe(true);
    });

    it('should return false when map is empty', () => {
      expect(isNonceUsed(apiKey, nonce, mapping)).toBe(false);
    });

    it('should return false when nonce is not found in mapping', () => {
      const apiNonces = new Set<string>();
      apiNonces.add(randomUUID());
      mapping.set(apiKey, apiNonces);

      expect(isNonceUsed(apiKey, nonce, mapping)).toBe(false);
    });
  });
});
