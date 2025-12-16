import { createHmac, createPrivateKey, createPublicKey, createSign, createVerify, timingSafeEqual } from 'crypto';

export class AlgorithmNotSupportedError extends Error {}

export type HashAlgorithm = 'sha256' | 'sha512' | 'sha3-256';
export type SigningAlgorithm = 'hmac' | 'rsa' | 'ecdsa';

export interface Signer {
  sign(payload: string, key: string, hashAlgorithm: HashAlgorithm): Buffer;
  verify(payload: string, key: string, signature: Buffer, hashAlgorithm: HashAlgorithm): boolean;
}

export class HMAC implements Signer {
  public sign(data: string, key: string, hashAlgorithm: HashAlgorithm): Buffer {
    return createHmac(hashAlgorithm, key).update(data, 'utf8').digest();
  }

  public verify(
    data: string,
    key: string,
    recv: Buffer,
    hashAlgorithm: HashAlgorithm
  ): boolean {
    const expected = this.sign(data, key, hashAlgorithm);
    return expected.length === recv.length && timingSafeEqual(new Uint8Array(expected), new Uint8Array(recv));
  }
}

export class RSA implements Signer {
  public sign(data: string, privateKey: string, hashAlgorithm: HashAlgorithm): Buffer {
    const priv = createPrivateKey({ key: pemToDer(privateKey), format: 'der', type: 'pkcs1' });
    const sign = createSign(`rsa-${hashAlgorithm}`);
    sign.update(data, 'utf8');
    return sign.sign(priv);
  }

  public verify(
    data: string,
    publicKey: string,
    signature: Buffer,
    hashAlgorithm: HashAlgorithm
  ): boolean {
    const pub = createPublicKey({ key: pemToDer(publicKey), format: 'der', type: 'spki' });
    const verify = createVerify(`rsa-${hashAlgorithm}`);
    verify.update(data, 'utf8');
    return verify.verify(pub, new Uint8Array(signature));
  }
}

export class ECDSA implements Signer {
  private validateHashAlgorithm(hashAlgorithm: HashAlgorithm) {
    if (hashAlgorithm !== 'sha256') {
      throw new AlgorithmNotSupportedError();
    }
  }

  public sign(data: string, privateKey: string, hashAlgorithm: HashAlgorithm): Buffer {
    this.validateHashAlgorithm(hashAlgorithm);
    const priv = createPrivateKey({ key: pemToDer(privateKey), format: 'der', type: 'sec1' });
    const sign = createSign('sha256');
    sign.update(data, 'utf8');
    return sign.sign(priv);
  }

  public verify(
    data: string,
    publicKey: string,
    signature: Buffer,
    hashAlgorithm: HashAlgorithm
  ): boolean {
    this.validateHashAlgorithm(hashAlgorithm);
    const pub = createPublicKey({ key: pemToDer(publicKey), format: 'der', type: 'spki' });
    const verify = createVerify('sha256');
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

function pemToDer(key: string): Buffer {
  const keyLines = key.split('\n').filter((line) => !line.startsWith('-----'));
  const cleaned = keyLines.join('').replace(/\r|\n/g, '');
  return Buffer.from(cleaned, 'base64');
}

export function getVerifyKey(privateKey: string, algorithm: SigningAlgorithm): string {
  switch (algorithm) {
    case 'hmac':
      return privateKey;
    case 'rsa':
      return generateRSAPublicKey(privateKey);
    case 'ecdsa':
      return generateECDSAPublicKey(privateKey);
  }
}

function generateRSAPublicKey(privateKey: string): string {
  const priv = createPrivateKey({ key: pemToDer(privateKey), format: 'der', type: 'pkcs1' });
  const pub = createPublicKey(priv).export({ type: 'spki', format: 'pem' }).toString();
  return pub;
}

function generateECDSAPublicKey(privateKey: string): string {
  const priv = createPrivateKey({ key: pemToDer(privateKey), format: 'der', type: 'sec1' });
  const pub = createPublicKey(priv).export({ type: 'spki', format: 'pem' }).toString();
  return pub;
}
