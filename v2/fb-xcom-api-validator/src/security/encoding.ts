import base58 from 'bs58';
import * as base32 from 'hi-base32';

export class UnsupportedEncodingFormatError extends Error {}

export type Encoding = 'plain' | 'base64' | 'hexstr' | 'base32' | 'base58';

export interface Encoder {
  encode(payload: string): string;
  decode(payload: string): string;
}

export class Plain implements Encoder {
  public encode(payload: string): string {
    return payload;
  }
  public decode(payload: string): string {
    return payload;
  }
}

export class Base64 implements Encoder {
  public encode(payload: string): string {
    return Buffer.from(payload).toString('base64');
  }
  public decode(payload: string): string {
    return Buffer.from(payload, 'base64').toString();
  }
}

export class HexStr implements Encoder {
  public encode(payload: string): string {
    return Buffer.from(payload).toString('hex');
  }
  public decode(payload: string): string {
    return Buffer.from(payload, 'hex').toString();
  }
}

export class Base32 implements Encoder {
  public encode(payload: string): string {
    return base32.encode(payload);
  }
  public decode(payload: string): string {
    return base32.decode(payload);
  }
}

export class Base58 implements Encoder {
  public encode(payload: string): string {
    return base58.encode(new TextEncoder().encode(payload));
  }
  public decode(payload: string): string {
    return new TextDecoder().decode(base58.decode(payload));
  }
}

export function encoderFactory(encoding: Encoding): Encoder {
  switch (encoding) {
    case 'plain':
      return new Plain();
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
