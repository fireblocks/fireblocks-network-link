import config from '../config';
import { Encoding, encoderFactory } from './encoding';
import { HashAlgorithm, SigningAlgorithm, getVerifyKey, signerFactory } from './signing';

export function verifySignature(payload: string, signature: string): boolean {
  const signingConfig = config.get('authentication').signing;
  const decodedSignature = decode(signature, signingConfig.postEncoding);
  const utf8Payload = Buffer.from(payload, 'utf8');
  const encodedPayload = encode(utf8Payload, signingConfig.preEncoding);
  return verify(
    encodedPayload,
    decodedSignature,
    signingConfig.signingAlgorithm,
    signingConfig.privateKey,
    signingConfig.hashAlgorithm
  );
}

export function buildRequestSignature(payload: string): string {
  const signingConfig = config.get('authentication').signing;
  const utf8Payload = Buffer.from(payload, 'utf8');
  const encodedPayload = encode(utf8Payload, signingConfig.preEncoding);
  const signature = sign(
    encodedPayload,
    signingConfig.signingAlgorithm,
    signingConfig.privateKey,
    signingConfig.hashAlgorithm
  );
  const encodedSignature = encode(signature, signingConfig.postEncoding);
  return encodedSignature;
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

function encode(payload: Buffer, encoding: Encoding): string {
  return encoderFactory(encoding).encode(payload);
}

function decode(payload: string, encoding: Encoding): Buffer {
  return encoderFactory(encoding).decode(payload);
}
