import { createHmac, createPrivateKey, createPublicKey, createSign, createVerify } from 'crypto';

export class InvalidSignatureError extends Error {
  public get responseObject(): { errorCode: string } {
    return {
      errorCode: 'invalid-signature',
    };
  }
}
export class AlgorithmNotSupportedError extends Error {}

export type HashAlgorithm = 'sha256' | 'sha512' | 'sha3-256';
export type SigningAlgorithm = 'hmac' | 'rsa' | 'ecdsa';

export interface Signer {
  sign(payload: string, key: string, hashAlgorithm: HashAlgorithm): string;
  verify(payload: string, key: string, signature: string, hashAlgorithm: HashAlgorithm): void;
}

export class HMAC implements Signer {
  public sign(data: string, key: string, hashAlgorithm: HashAlgorithm): string {
    return createHmac(hashAlgorithm, key).update(data).digest().toString('binary');
  }

  public verify(
    data: string,
    key: string,
    recv_signature: string,
    hashAlgorithm: HashAlgorithm
  ): void {
    const signature = this.sign(data, key, hashAlgorithm);
    if (signature !== recv_signature) {
      throw new InvalidSignatureError();
    }
  }
}

export class RSA implements Signer {
  public sign(data: string, privateKey: string, hashAlgorithm: HashAlgorithm): string {
    const priv = createPrivateKey({ key: pemToDer(privateKey), format: 'der', type: 'pkcs1' });
    const sign = createSign(`rsa-${hashAlgorithm}`);
    sign.update(data);
    const sigBuffer = sign.sign(priv);
    return sigBuffer.toString('binary');
  }

  public verify(
    data: string,
    publicKey: string,
    signature: string,
    hashAlgorithm: HashAlgorithm
  ): void {
    const pub = createPublicKey({ key: pemToDer(publicKey), format: 'der', type: 'spki' });
    const verify = createVerify(`rsa-${hashAlgorithm}`);
    verify.update(data);
    const isValid = verify.verify(pub, Buffer.from(signature, 'binary'));
    if (!isValid) {
      throw new InvalidSignatureError();
    }
  }
}

export class ECDSA implements Signer {
  private validateHashAlgorithm(hashAlgorithm: HashAlgorithm) {
    if (hashAlgorithm !== 'sha256') {
      throw new AlgorithmNotSupportedError();
    }
  }

  public sign(data: string, privateKey: string, hashAlgorithm: HashAlgorithm): string {
    this.validateHashAlgorithm(hashAlgorithm);
    const priv = createPrivateKey({ key: pemToDer(privateKey), format: 'der', type: 'sec1' });
    const sign = createSign('sha256');
    sign.update(data);
    const sigBuffer = sign.sign(priv);
    return sigBuffer.toString('binary');
  }

  public verify(
    data: string,
    publicKey: string,
    signature: string,
    hashAlgorithm: HashAlgorithm
  ): void {
    this.validateHashAlgorithm(hashAlgorithm);
    const pub = createPublicKey({ key: pemToDer(publicKey), format: 'der', type: 'spki' });
    const verify = createVerify('sha256');
    verify.update(data);
    const isValid = verify.verify(pub, Buffer.from(signature, 'binary'));
    if (!isValid) {
      throw new InvalidSignatureError();
    }
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
  const keyLines = key.split('\n');
  const keyLinesWithNoHeaders = keyLines.filter((line) => !line.startsWith('-----'));

  const cleanedPrivateKey = keyLinesWithNoHeaders.join('').replace(/\n|\r/g, '');

  return Buffer.from(cleanedPrivateKey, 'base64');
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
