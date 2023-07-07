import convict from 'convict';
import path from 'path';
import fs from 'fs';
import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

const config = convict({
  env: {
    doc: 'The execution environment',
    format: ['production', 'development', 'test'],
    default: 'production',
    env: 'NODE_ENV',
  },
  server: {
    port: {
      doc: 'The port on which the server listens',
      format: 'port',
      default: 8000,
      env: 'PORT',
    },
  },
  client: {
    serverBaseUrl: {
      doc: 'URL of the server that will be used to run the tests',
      default: 'http://localhost:8000/',
      env: 'SERVER',
    },
  },
  logging: {
    level: {
      doc: 'Log verbosity level',
      format: ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'],
      default: 'info',
      env: 'LOG_LEVEL',
    },
  },
  auth: {
    apiKey: {
      doc: 'API key used for identification',
      env: 'API_KEY',
      default: "",
    },
    signing: {
      privateKey: {
        doc: 'Private key to sign requests',
        env: 'PRIVATE_KEY',
        default: "",
      },
      publicKey: {
        doc: 'Key to verify requests (only used for stub server)',
        env: 'PUBLIC_KEY',
        default: "",
      },
      requestEncodingFormat: {
        doc: 'Encoding format to pre-signed request',
        format: ['plain', 'base64', 'hexstr', 'base58', 'base32'],
        default: 'plain',
        env: 'REQUEST_ENCODING_FORMAT',
      },
      signingAlgorithm: {
        doc: 'Algorithm to use for signing the request',
        format: ['hmac', 'rsa', 'ecdsa'],
        default: 'hmac',
        env: 'SIGNING_ALGORITHM',
      },
      requestSigningFormat: {
        doc: 'Internal hashing algorithm for the signature',
        format: ['sha256', 'sha512', 'sha3-256'],
        default: 'sha256',
        env: 'REQUEST_SIGNING_FORMAT'
      },
      signatureEncodingFormat: {
        doc: 'Encoding format to signature',
        format: ['plain', 'base64', 'hexstr', 'base58', 'base32'],
        default: 'plain',
        env: 'SIGNATURE_ENCODING_FORMAT',
      },
    }
  },
  openApi: {
    location: {
      doc: 'The directory where the OpenAPI files are located',
      format: filename,
      default: '../fb-xcom-openapi',
    },
    components: {
      doc: 'Files defining the various API components; specified relative to openApi.location',
      format: Array<string>,
      default: [
        'fb-provider-api.yaml',
        'fb-provider-liquidity-api.yaml',
        'fb-provider-trading-api.yaml',
        'fb-provider-transfer-api.yaml',
      ],
    },
    unifiedFilename: {
      doc: 'Unified OpenAPI file containing all the components in the same file',
      default: 'fb-xcom-unified-openapi.yaml',
    },
  },
});

function filename(f: string) {
  if (!fs.existsSync(f)) {
    throw new Error(`Configuration error: no such file or directory`);
  }
}

const filePath = path.join(__dirname, `${config.get('env')}.json`);
if (fs.existsSync(filePath)) {
  config.loadFile(filePath);
}

config.validate({ allowed: 'strict' });

export default config;
