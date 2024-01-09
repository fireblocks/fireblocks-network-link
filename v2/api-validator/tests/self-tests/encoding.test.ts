import { encoderFactory } from '../../src/security/encoding';

const data = 'All in the golden afternoon Full leisurely we glide';
const urlEncoded = 'All%20in%20the%20golden%20afternoon%20Full%20leisurely%20we%20glide';
const base64Encoded = 'QWxsIGluIHRoZSBnb2xkZW4gYWZ0ZXJub29uIEZ1bGwgbGVpc3VyZWx5IHdlIGdsaWRl';
const hexEncoded =
  '416c6c20696e2074686520676f6c64656e2061667465726e6f6f6e2046756c6c206c6569737572656c7920776520676c696465';
const base32Encoded =
  'IFWGYIDJNYQHI2DFEBTW63DEMVXCAYLGORSXE3TPN5XCARTVNRWCA3DFNFZXK4TFNR4SA53FEBTWY2LEMU======';
const base58Encoded = '4ZMy2teLGsR5CW9yw1h1pBaJuc3wEPNJZ7h2t9vnJimLJjUhvwSc3FPFQXyJ2p1BTLXdMn';

const binaryData = 'Ki\x19;\x7F(\x9E×Ï\x060u¯}°´)\f<ÑTÐ\x96\x1BJ\x80ý\x02aåu\x0E';
const binaryUrlEncoded =
  'Ki%19%3B%7F(%C2%9E%C3%97%C3%8F%060u%C2%AF%7D%C2%B0%C2%B4)%0C%3C%C3%91T%C3%90%C2%96%1BJ%C2%80%C3%BD%02a%C3%A5u%0E';
const binaryBase64Encoded = 'S2kZO38ontfPBjB1r32wtCkMPNFU0JYbSoD9AmHldQ4=';
const binaryHexEncoded = '4b69193b7f289ed7cf063075af7db0b4290c3cd154d0961b4a80fd0261e5750e';
const binaryBase32Encoded = 'JNURSO37FCPNPTYGGB2267NQWQUQYPGRKTIJMG2KQD6QEYPFOUHA====';
const binaryBase58Encoded = '65NXZwr65Ueec7sXD1RuVbjHBnAswtjeUzuknuai56zZ';

describe('Encoding methods', () => {
  describe('Encoding utf-8 payload', () => {
    it('should match encoding examples', () => {
      expect(encoderFactory('url-encoded').encode(data)).toBe(urlEncoded);
      expect(encoderFactory('base32').encode(data)).toBe(base32Encoded);
      expect(encoderFactory('base58').encode(data)).toBe(base58Encoded);
      expect(encoderFactory('base64').encode(data)).toBe(base64Encoded);
      expect(encoderFactory('hexstr').encode(data)).toBe(hexEncoded);
    });
  });

  describe('Encoding binary payload', () => {
    it('should match encoding examples', () => {
      expect(encoderFactory('url-encoded').encode(binaryData)).toBe(binaryUrlEncoded);
      expect(encoderFactory('base32').encode(binaryData)).toBe(binaryBase32Encoded);
      expect(encoderFactory('base58').encode(binaryData)).toBe(binaryBase58Encoded);
      expect(encoderFactory('base64').encode(binaryData)).toBe(binaryBase64Encoded);
      expect(encoderFactory('hexstr').encode(binaryData)).toBe(binaryHexEncoded);
    });
  });

  describe('Decoding encoded utf-8 examples', () => {
    it('should match payload', () => {
      expect(encoderFactory('url-encoded').decode(urlEncoded)).toBe(data);
      expect(encoderFactory('base32').decode(base32Encoded)).toBe(data);
      expect(encoderFactory('base58').decode(base58Encoded)).toBe(data);
      expect(encoderFactory('base64').decode(base64Encoded)).toBe(data);
      expect(encoderFactory('hexstr').decode(hexEncoded)).toBe(data);
    });
  });

  describe('Decoding encoded binary examples', () => {
    it('should match payload', () => {
      expect(encoderFactory('url-encoded').decode(binaryUrlEncoded)).toBe(binaryData);
      expect(encoderFactory('base32').decode(binaryBase32Encoded)).toBe(binaryData);
      expect(encoderFactory('base58').decode(binaryBase58Encoded)).toBe(binaryData);
      expect(encoderFactory('base64').decode(binaryBase64Encoded)).toBe(binaryData);
      expect(encoderFactory('hexstr').decode(binaryHexEncoded)).toBe(binaryData);
    });
  });
});
