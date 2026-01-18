import { encoderFactory } from '../../src/security/encoding';

const data = '@All in the golden afternoon Full leisurely we glide Loïc';
const urlEncoded =
  '%40All%20in%20the%20golden%20afternoon%20Full%20leisurely%20we%20glide%20Lo%C3%AFc';
const base64Encoded =
  'QEFsbCBpbiB0aGUgZ29sZGVuIGFmdGVybm9vbiBGdWxsIGxlaXN1cmVseSB3ZSBnbGlkZSBMb8OvYw==';
const hexEncoded =
  '40416c6c20696e2074686520676f6c64656e2061667465726e6f6f6e2046756c6c206c6569737572656c7920776520676c696465204c6fc3af63';
const base32Encoded =
  'ibawy3banfxca5dimuqgo33mmrsw4idbmz2gk4ton5xw4icgovwgyidmmvuxg5lsmvwhsidxmuqgo3djmrssatdpyoxwg===';
const base58Encoded =
  'auE4EbJzZ5ve1ToCpfjPUfjQyvktEqzu4drHFs8UemGV6yRrdNkvDAZpnqgSLUBFJuDAcRuFPt58Tqc';

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

  describe('Decoding encoded utf-8 examples', () => {
    it('should match payload', () => {
      expect(encoderFactory('url-encoded').decode(urlEncoded)).toBe(data);
      expect(encoderFactory('base32').decode(base32Encoded)).toBe(data);
      expect(encoderFactory('base58').decode(base58Encoded)).toBe(data);
      expect(encoderFactory('base64').decode(base64Encoded)).toBe(data);
      expect(encoderFactory('hexstr').decode(hexEncoded)).toBe(data);
    });
  });
});
