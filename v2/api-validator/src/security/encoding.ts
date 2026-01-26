import base58 from 'bs58';
import * as base32 from 'hi-base32';

export class UnsupportedEncodingFormatError extends Error {}

export type Encoding = 'url-encoded' | 'base64' | 'hexstr' | 'base32' | 'base58';

export interface Encoder {
  encode(payload: Buffer): string;
  decode(payload: string): Buffer;
}

export class URL implements Encoder {
  public encode(payload: Buffer): string {
    return encodeURIComponent(payload.toString('utf8'));
  }
  public decode(payload: string): Buffer {
    return Buffer.from(decodeURIComponent(payload), 'utf8');
  }
}

export class Base64 implements Encoder {
  public encode(payload: Buffer): string {
    return payload.toString('base64');
  }
  public decode(payload: string): Buffer {
    return Buffer.from(payload, 'base64');
  }
}

export class HexStr implements Encoder {
  public encode(payload: Buffer): string {
    return payload.toString('hex');
  }
  public decode(payload: string): Buffer {
    return Buffer.from(payload, 'hex');
  }
}

export class Base32 implements Encoder {
  public encode(payload: Buffer): string {
    return base32.encode(new Uint8Array(payload)).toLowerCase();
  }
  public decode(payload: string): Buffer {
    return Buffer.from(base32.decode.asBytes(payload.toUpperCase()));
  }
}

export class Base58 implements Encoder {
  public encode(payload: Buffer): string {
    return base58.encode(new Uint8Array(payload));
  }
  public decode(payload: string): Buffer {
    return Buffer.from(base58.decode(payload));
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
