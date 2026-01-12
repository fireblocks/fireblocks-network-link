import base58 from 'bs58';
import * as base32 from 'hi-base32';

export class UnsupportedEncodingFormatError extends Error {}

export type Encoding = 'url-encoded' | 'base64' | 'hexstr' | 'base32' | 'base58';

export interface Encoder {
  encode(payload: string): string;
  decode(payload: string): string;
}

export class URL implements Encoder {
  public encode(payload: string): string {
    return encodeURIComponent(payload);
  }
  public decode(payload: string): string {
    return decodeURIComponent(payload);
  }
}

export class Base64 implements Encoder {
  public encode(payload: string): string {
    return Buffer.from(payload, 'utf8').toString('base64');
  }
  public decode(payload: string): string {
    return Buffer.from(payload, 'base64').toString('utf8');
  }
}

export class HexStr implements Encoder {
  public encode(payload: string): string {
    return Buffer.from(payload, 'utf8').toString('hex');
  }
  public decode(payload: string): string {
    return Buffer.from(payload, 'hex').toString('utf8');
  }
}

export class Base32 implements Encoder {
  public encode(payload: string): string {
    return base32.encode(new Uint8Array(Buffer.from(payload, 'utf8'))).toLowerCase();
  }
  public decode(payload: string): string {
    return Buffer.from(base32.decode.asBytes(payload.toUpperCase())).toString('utf8');
  }
}

export class Base58 implements Encoder {
  public encode(payload: string): string {
    return base58.encode(new Uint8Array(Buffer.from(payload, 'utf8')));
  }
  public decode(payload: string): string {
    return Buffer.from(base58.decode(payload)).toString('utf8');
  }
}

export function encoderFactory(encoding: Encoding): Encoder {
  switch (encoding) {
    case 'url-encoded':
      return new URL();
    case 'base32':
      return new Base32();
    case 'base58':
      return new Base58();
    case 'base64':
      return new Base64();
    case 'hexstr':
      return new HexStr();
    default:
      throw new UnsupportedEncodingFormatError();
  }
}

// Byte-level helpers for encoding signature bytes (or other binary blobs) into header-safe strings,
// and decoding them back into bytes.
export function encodeBytes(data: Buffer, encoding: Encoding): string {
  switch (encoding) {
    case 'base64':
      return data.toString('base64');
    case 'hexstr':
      return data.toString('hex');
    case 'base58':
      return base58.encode(new Uint8Array(data));
    case 'url-encoded':
      // URL-encoded form is defined over a base64 string representation.
      return encodeURIComponent(data.toString('base64'));
    case 'base32':
      return base32.encode(new Uint8Array(data));
    default:
      throw new UnsupportedEncodingFormatError();
  }
}

export function decodeToBytes(data: string, encoding: Encoding): Buffer {
  switch (encoding) {
    case 'base64':
      return Buffer.from(data, 'base64');
    case 'hexstr':
      return Buffer.from(data, 'hex');
    case 'base58':
      return Buffer.from(base58.decode(data));
    case 'url-encoded':
      return Buffer.from(decodeURIComponent(data), 'base64');
    case 'base32':
      return Buffer.from(base32.decode.asBytes(data));
    default:
      throw new UnsupportedEncodingFormatError();
  }
}
