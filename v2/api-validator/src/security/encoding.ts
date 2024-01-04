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
    return Buffer.from(payload, 'binary').toString('base64');
  }
  public decode(payload: string): string {
    return Buffer.from(payload, 'base64').toString('binary');
  }
}

export class HexStr implements Encoder {
  public encode(payload: string): string {
    return Buffer.from(payload, 'binary').toString('hex');
  }
  public decode(payload: string): string {
    return Buffer.from(payload, 'hex').toString('binary');
  }
}

export class Base32 implements Encoder {
  public encode(payload: string): string {
    return base32.encode(Buffer.from(payload, 'binary'));
  }
  public decode(payload: string): string {
    return Buffer.from(base32.decode.asBytes(payload)).toString('binary');
  }
}

export class Base58 implements Encoder {
  public encode(payload: string): string {
    return base58.encode(Buffer.from(payload, 'binary'));
  }
  public decode(payload: string): string {
    return Buffer.from(base58.decode(payload)).toString('binary');
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
