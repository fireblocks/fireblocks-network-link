import config from '../src/config';
import { getRequestSignature, verifySignature } from '../src/security/auth-provider';
import { InvalidSignatureError } from '../src/security/signing';

describe('Signature creation and verification', () => {
  let signature: string;
  let authConfig;
  const method = 'GET';
  const url = '/capabilities';
  const body = null;
  const timestamp = 123;
  const nonce = '123';

  beforeAll(() => {
    authConfig = config.get('authentication');
    signature = getRequestSignature(method, url, body, timestamp, nonce, authConfig.signing);
  });

  it('should validate signature successfully', () => {
    expect(() => {
      verifySignature(method, url, body, timestamp, nonce, signature);
    }).not.toThrow();
  });

  describe('Verify the created signature with different payload', () => {
    it('should fail', () => {
      expect(() => {
        verifySignature('POST', url, body, timestamp, nonce, signature);
      }).toThrow(InvalidSignatureError);
    });
  });
});
