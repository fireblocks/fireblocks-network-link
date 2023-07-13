import { InvalidSignatureError } from '../src/security/signing';
import { buildRequestSignature, verifySignature } from '../src/security/auth-provider';

describe('Signature creation and verification', () => {
  let signature: string;
  const payload = 'payload';
  const differentPayload = 'different-payload';

  beforeAll(() => {
    signature = buildRequestSignature(payload);
  });

  it('should validate signature successfully', () => {
    expect(() => {
      verifySignature(payload, signature);
    }).not.toThrow();
  });

  describe('Verify the created signature with different payload', () => {
    it('should fail', () => {
      expect(() => {
        verifySignature(differentPayload, signature);
      }).toThrow(InvalidSignatureError);
    });
  });
});
