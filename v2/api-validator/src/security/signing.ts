import { createHmac, createPrivateKey, createPublicKey, createSign, createVerify, timingSafeEqual } from 'crypto';

export class AlgorithmNotSupportedError extends Error {}

export type HashAlgorithm = 'sha256' | 'sha512' | 'sha3-256';
export type SigningAlgorithm = 'hmac' | 'rsa' | 'ecdsa';

export type KeyInput = string;

export interface Signer {
  sign(payload: string, key: KeyInput, hashAlgorithm: HashAlgorithm): Buffer;
  verify(payload: string, key: KeyInput, signature: Buffer, hashAlgorithm: HashAlgorithm): boolean;
}

export class HMAC implements Signer {
  public sign(data: string, key: KeyInput, hashAlgorithm: HashAlgorithm): Buffer {
    return createHmac(hashAlgorithm, key).update(data, 'utf8').digest();
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
    const priv = createPrivateKey(privateKey);
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
    const pub = createPublicKey(publicKey);
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
    const priv = createPrivateKey(privateKey);
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
    const pub = createPublicKey(publicKey);
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

export function getVerifyKey(privateKey: KeyInput, algorithm: SigningAlgorithm): string {
  switch (algorithm) {
    case 'hmac':
      return privateKey;
    case 'rsa':
      return generateRSAPublicKey(privateKey);
    case 'ecdsa':
      return generateECDSAPublicKey(privateKey);
  }
}

function generateRSAPublicKey(privateKey: KeyInput): string {
  const priv = createPrivateKey(privateKey);
  const pub = createPublicKey(priv).export({ type: 'spki', format: 'pem' }).toString();
  return pub;
}

function generateECDSAPublicKey(privateKey: KeyInput): string {
  const priv = createPrivateKey(privateKey);
  const pub = createPublicKey(priv).export({ type: 'spki', format: 'pem' }).toString();
  return pub;
}
