import { encoderFactory } from '../src/security/encoding';

describe('Encoding methods', () => {
  const data = 'All in the golden afternoon Full leisurely we glide';
  const base64Encoded = 'QWxsIGluIHRoZSBnb2xkZW4gYWZ0ZXJub29uIEZ1bGwgbGVpc3VyZWx5IHdlIGdsaWRl';
  const hexEncoded =
    '416c6c20696e2074686520676f6c64656e2061667465726e6f6f6e2046756c6c206c6569737572656c7920776520676c696465';
  const base32Encoded =
    'IFWGYIDJNYQHI2DFEBTW63DEMVXCAYLGORSXE3TPN5XCARTVNRWCA3DFNFZXK4TFNR4SA53FEBTWY2LEMU======';
  const base58Encoded = '4ZMy2teLGsR5CW9yw1h1pBaJuc3wEPNJZ7h2t9vnJimLJjUhvwSc3FPFQXyJ2p1BTLXdMn';

  describe('Encoding payload', () => {
    it('should match encoding examples', () => {
      expect(encoderFactory('plain').encode(data)).toBe(data);
      expect(encoderFactory('base32').encode(data)).toBe(base32Encoded);
      expect(encoderFactory('base58').encode(data)).toBe(base58Encoded);
      expect(encoderFactory('base64').encode(data)).toBe(base64Encoded);
      expect(encoderFactory('hexstr').encode(data)).toBe(hexEncoded);
    });
  });

  describe('Decoding encoded examples', () => {
    it('should match payload', () => {
      expect(encoderFactory('plain').decode(data)).toBe(data);
      expect(encoderFactory('base32').decode(base32Encoded)).toBe(data);
      expect(encoderFactory('base58').decode(base58Encoded)).toBe(data);
      expect(encoderFactory('base64').decode(base64Encoded)).toBe(data);
      expect(encoderFactory('hexstr').decode(hexEncoded)).toBe(data);
    });
  });
});
