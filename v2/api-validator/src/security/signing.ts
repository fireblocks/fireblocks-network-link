import { createHmac, createPrivateKey, createPublicKey, createSign, createVerify, timingSafeEqual, KeyObject } from 'crypto';

export class AlgorithmNotSupportedError extends Error {}

export type HashAlgorithm = 'sha256' | 'sha512' | 'sha3-256';
export type SigningAlgorithm = 'hmac' | 'rsa' | 'ecdsa';

export type KeyInput = string | Buffer | KeyObject;

export interface Signer {
  sign(payload: string, key: KeyInput, hashAlgorithm: HashAlgorithm): Buffer;
  verify(payload: string, key: KeyInput, signature: Buffer, hashAlgorithm: HashAlgorithm): boolean;
}

export class HMAC implements Signer {
  public sign(data: string, key: KeyInput, hashAlgorithm: HashAlgorithm): Buffer {
    const hmacKey = key instanceof KeyObject ? key : Buffer.isBuffer(key) ? Uint8Array.from(key) : key;
    return createHmac(hashAlgorithm, hmacKey).update(data, 'utf8').digest();
  }

  public verify(
    data: string,
    key: KeyInput,
    recv: Buffer,
    hashAlgorithm: HashAlgorithm
  ): boolean {
    const expected = this.sign(data, key, hashAlgorithm);
    return expected.length === recv.length && timingSafeEqual(new Uint8Array(expected), new Uint8Array(recv));
  }
}

export class RSA implements Signer {
  public sign(data: string, privateKey: KeyInput, hashAlgorithm: HashAlgorithm): Buffer {
    const priv = loadPrivateKey(privateKey, 'pkcs1');
    const sign = createSign(`rsa-${hashAlgorithm}`);
    sign.update(data, 'utf8');
    return sign.sign(priv);
  }

  public verify(
    data: string,
    publicKey: KeyInput,
    signature: Buffer,
    hashAlgorithm: HashAlgorithm
  ): boolean {
    const pub = loadPublicKey(publicKey);
    const verify = createVerify(`rsa-${hashAlgorithm}`);
    verify.update(data, 'utf8');
    return verify.verify(pub, new Uint8Array(signature));
  }
}

export class ECDSA implements Signer {
  private validateHashAlgorithm(hashAlgorithm: HashAlgorithm) {
    // SGX signer supports only SHA-256 for ECDSA
    if (hashAlgorithm !== 'sha256') {
      throw new AlgorithmNotSupportedError();
    }
  }

  public sign(data: string, privateKey: KeyInput, hashAlgorithm: HashAlgorithm): Buffer {
    this.validateHashAlgorithm(hashAlgorithm);
    const priv = loadPrivateKey(privateKey, 'sec1');
    const sign = createSign(hashAlgorithm);
    sign.update(data, 'utf8');
    return sign.sign(priv);
  }

  public verify(
    data: string,
    publicKey: KeyInput,
    signature: Buffer,
    hashAlgorithm: HashAlgorithm
  ): boolean {
    this.validateHashAlgorithm(hashAlgorithm);
    const pub = loadPublicKey(publicKey);
    const verify = createVerify(hashAlgorithm);
    verify.update(data, 'utf8');
    return verify.verify(pub, new Uint8Array(signature));
  }
}

export function signerFactory(algorithm: SigningAlgorithm): Signer {
  switch (algorithm) {
    case 'hmac':
      return new HMAC();
    case 'rsa':
      return new RSA();
    case 'ecdsa':
      return new ECDSA();
  }
}

function normalizeKeyToString(key: KeyInput): string {
  if (typeof key === 'string') return key;
  if (Buffer.isBuffer(key)) return key.toString('utf8');
  if (key instanceof KeyObject) {
    return key.export({ type: 'pkcs8', format: 'pem' }).toString();
  }
  throw new Error('Unsupported key type');
}

export function getVerifyKey(privateKey: KeyInput, algorithm: SigningAlgorithm): string {
  switch (algorithm) {
    case 'hmac':
      return normalizeKeyToString(privateKey);
    case 'rsa':
      return generateRSAPublicKey(privateKey);
    case 'ecdsa':
      return generateECDSAPublicKey(privateKey);
  }
}

function generateRSAPublicKey(privateKey: KeyInput): string {
  const priv = loadPrivateKey(privateKey, 'pkcs1');
  const pub = createPublicKey(priv).export({ type: 'spki', format: 'pem' }).toString();
  return pub;
}

function generateECDSAPublicKey(privateKey: KeyInput): string {
  const priv = loadPrivateKey(privateKey, 'sec1');
  const pub = createPublicKey(priv).export({ type: 'spki', format: 'pem' }).toString();
  return pub;
}

function loadPrivateKey(key: KeyInput, fallbackDerType: 'pkcs1' | 'sec1') {
  if (key instanceof KeyObject) return key;
  if (Buffer.isBuffer(key)) {
    const attemptPkcs1OrSec1 = createPrivateKey({ key, format: 'der', type: fallbackDerType });
    return attemptPkcs1OrSec1;
  }
  return createPrivateKey(normalizeKeyToString(key));
}

function loadPublicKey(key: KeyInput) {
  if (key instanceof KeyObject) return key;
  if (Buffer.isBuffer(key)) {
    return createPublicKey({ key, format: 'der', type: 'spki' });
  }
  return createPublicKey(normalizeKeyToString(key));
}
