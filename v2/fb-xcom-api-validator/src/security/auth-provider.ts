import config from '../config';
import { HTTPMethods } from 'fastify';
import { Encoding, encoderFactory } from './encoding';
import { HashAlgorithm, SigningAlgorithm, getVerifyKey, signerFactory } from './signing';

export function verifySignature(
  method: HTTPMethods,
  endpoint: string,
  body: any,
  timestamp: number,
  nonce: string,
  signature: string
): void {
  const signingConfig = config.get('authentication').signing;
  const decodedSignature = decode(signature, signingConfig.postEncoding);
  const prehashString = createPrehashString(method, endpoint, body, timestamp, nonce);
  const encodedPrehashString = encode(prehashString, signingConfig.preEncoding);
  verify(
    encodedPrehashString,
    decodedSignature,
    signingConfig.signingAlgorithm,
    signingConfig.privateKey,
    signingConfig.hashAlgorithm
  );
}

function createPrehashString(
  method: HTTPMethods,
  endpoint: string,
  body: any,
  timestamp: number,
  nonce: string
): string {
  return `${timestamp}${nonce}${method.toUpperCase()}${endpoint}${stringifyBody(body)}`;
}

export function getRequestSignature(
  method: HTTPMethods,
  endpoint: string,
  body: any,
  timestamp: number,
  nonce: string,
  signingConfig: any
): string {
  const prehashString = createPrehashString(method, endpoint, body, timestamp, nonce);
  const encodedPrehashString = encode(prehashString, signingConfig.preEncoding);
  const signature = sign(
    encodedPrehashString,
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
): string {
  return signerFactory(signingAlgorithm).sign(payload, privateKey, hashAlgorithm);
}

function verify(
  payload: string,
  decodedSignature: string,
  signingAlgorithm: SigningAlgorithm,
  privateKey: string,
  hashAlgorithm: HashAlgorithm
): void {
  signerFactory(signingAlgorithm).verify(
    payload,
    getVerifyKey(privateKey, signingAlgorithm),
    decodedSignature,
    hashAlgorithm
  );
}

function encode(payload: string, encoding: Encoding): string {
  return encoderFactory(encoding).encode(payload);
}

function decode(payload: string, encoding: Encoding): string {
  return encoderFactory(encoding).decode(payload);
}

function stringifyBody(body): string {
  if (!body) {
    return '';
  }
  return JSON.stringify(body);
}
