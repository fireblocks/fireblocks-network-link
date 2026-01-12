import base58 from 'bs58';
import * as base32 from 'hi-base32';

export class UnsupportedEncodingFormatError extends Error {}

export type Encoding = 'url-encoded' | 'base64' | 'hexstr' | 'base32' | 'base58';

export interface Encoder {
  encode(payload: string): string;
  decode(payload: string): string;
}

export interface ByteCodec {
  encodeBytes(data: Buffer): string;
  decodeToBytes(data: string): Buffer;
}

export class URL implements Encoder {
  public encode(payload: string): string {
    return encodeURIComponent(payload);
  }
  public decode(payload: string): string {
    return decodeURIComponent(payload);
  }
  public encodeBytes(data: Buffer): string {
    // URL-encoded form is defined over a base64 string representation.
    return encodeURIComponent(data.toString('base64'));
  }
  public decodeToBytes(data: string): Buffer {
    return Buffer.from(decodeURIComponent(data), 'base64');
  }
}

export class Base64 implements Encoder {
  public encode(payload: string): string {
    return Buffer.from(payload, 'utf8').toString('base64');
  }
  public decode(payload: string): string {
    return Buffer.from(payload, 'base64').toString('utf8');
  }
  public encodeBytes(data: Buffer): string {
    return data.toString('base64');
  }
  public decodeToBytes(data: string): Buffer {
    return Buffer.from(data, 'base64');
  }
}

export class HexStr implements Encoder {
  public encode(payload: string): string {
    return Buffer.from(payload, 'utf8').toString('hex');
  }
  public decode(payload: string): string {
    return Buffer.from(payload, 'hex').toString('utf8');
  }
  public encodeBytes(data: Buffer): string {
    return data.toString('hex');
  }
  public decodeToBytes(data: string): Buffer {
    return Buffer.from(data, 'hex');
  }
}

export class Base32 implements Encoder {
  public encode(payload: string): string {
    return base32.encode(new Uint8Array(Buffer.from(payload, 'utf8'))).toLowerCase();
  }
  public decode(payload: string): string {
    return Buffer.from(base32.decode.asBytes(payload.toUpperCase())).toString('utf8');
  }
  public encodeBytes(data: Buffer): string {
    return base32.encode(new Uint8Array(data));
  }
  public decodeToBytes(data: string): Buffer {
    return Buffer.from(base32.decode.asBytes(data.toUpperCase()));
  }
}

export class Base58 implements Encoder {
  public encode(payload: string): string {
    return base58.encode(new Uint8Array(Buffer.from(payload, 'utf8')));
  }
  public decode(payload: string): string {
    return Buffer.from(base58.decode(payload)).toString('utf8');
  }
  public encodeBytes(data: Buffer): string {
    return base58.encode(new Uint8Array(data));
  }
  public decodeToBytes(data: string): Buffer {
    return Buffer.from(base58.decode(data));
  }
}

export function encoderFactory(encoding: Encoding): Encoder & ByteCodec {
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
