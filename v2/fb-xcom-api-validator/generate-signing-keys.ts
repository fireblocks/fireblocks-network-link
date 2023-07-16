import { KeyPairSyncResult, generateKeyPairSync } from 'crypto';

function createRSAKeyPair(): KeyPairSyncResult<string, string> {
  return generateKeyPairSync('rsa', {
    modulusLength: 1024,
    publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
  });
}

function generateECDSAsecp256k1KeyPair(): KeyPairSyncResult<string, string> {
  return generateKeyPairSync('ec', {
    namedCurve: 'secp256k1',
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
}

function generateECDSAP256KeyPair(): KeyPairSyncResult<string, string> {
  return generateKeyPairSync('ec', {
    namedCurve: 'prime256v1',
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
}

function generateKeys() {
  const keyType = process.argv[2];
  let keyPair: KeyPairSyncResult<string, string>;

  switch (keyType) {
    case 'rsa':
      keyPair = createRSAKeyPair();
      break;
    case 'ecdsa-secp256k1':
      keyPair = generateECDSAsecp256k1KeyPair();
      break;
    case 'ecdsa-prime256v1':
      keyPair = generateECDSAP256KeyPair();
      break;
    default:
      throw new Error('Invalid key type');
  }

  console.log(`Private key:\n\n${keyPair.privateKey}`);
  console.log(`Public key:\n\n${keyPair.publicKey}`);
}

generateKeys();
