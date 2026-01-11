import base58 from 'bs58';
import * as base32 from 'hi-base32';
import config from '../config';
import { Encoding, encoderFactory, UnsupportedEncodingFormatError } from './encoding';
import { HashAlgorithm, SigningAlgorithm, getVerifyKey, signerFactory } from './signing';

export function verifySignature(payload: string, signature: string): boolean {
  const signingConfig = config.get('authentication').signing;
  const encodedPayload = encode(payload, signingConfig.preEncoding);
  const sigBytes = decodeToBytes(signature, signingConfig.postEncoding);
  return verify(
    encodedPayload,
    sigBytes,
    signingConfig.signingAlgorithm,
    signingConfig.privateKey,
    signingConfig.hashAlgorithm
  );
}

export function buildRequestSignature(payload: string): string {
  const signingConfig = config.get('authentication').signing;
  const encodedPayload = encode(payload, signingConfig.preEncoding);
  const sigBytes = sign(
    encodedPayload,
    signingConfig.signingAlgorithm,
    signingConfig.privateKey,
    signingConfig.hashAlgorithm
  );
  return encodeBytes(sigBytes, signingConfig.postEncoding);
}

function sign(
  payload: string,
  signingAlgorithm: SigningAlgorithm,
  privateKey: string,
  hashAlgorithm: HashAlgorithm
): Buffer {
  return signerFactory(signingAlgorithm).sign(payload, privateKey, hashAlgorithm);
}

function verify(
  payload: string,
  decodedSignature: Buffer,
  signingAlgorithm: SigningAlgorithm,
  privateKey: string,
  hashAlgorithm: HashAlgorithm
): boolean {
  return signerFactory(signingAlgorithm).verify(
    payload,
    getVerifyKey(privateKey, signingAlgorithm),
    decodedSignature,
    hashAlgorithm
  );
}

function encode(payload: string, encoding: Encoding): string {
  return encoderFactory(encoding).encode(payload);
}

function encodeBytes(data: Buffer, encoding: Encoding): string {
  switch (encoding) {
    case 'base64':
      return data.toString('base64');
    case 'hexstr':
      return data.toString('hex');
    case 'base58':
      return base58.encode(new Uint8Array(data));
    case 'url-encoded':
      return encodeURIComponent(data.toString('base64'));
    case 'base32':
      return base32.encode(new Uint8Array(data));
    default:
      throw new UnsupportedEncodingFormatError();
  }
}

function decodeToBytes(data: string, encoding: Encoding): Buffer {
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
