import config from '../config';
import { Encoding, decodeToBytes, encodeBytes, encoderFactory } from './encoding';
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
