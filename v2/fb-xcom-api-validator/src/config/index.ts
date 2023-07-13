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
      default: 'http://0.0.0.0:8000',
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
  authentication: {
    apiKey: {
      doc: 'API key used for identification',
      env: 'API_KEY',
      format: String,
      default: null,
    },
    signing: {
      privateKey: {
        doc: 'Raw string of private key to sign requests. For RSA and ECDSA in pem format',
        env: 'SIGNING_PRIVATE_KEY',
        format: String,
        default: null,
      },
      preEncoding: {
        doc: 'Encoding to be applied to the data before it is signed',
        format: ['url-encoding', 'base64', 'hexstr', 'base58', 'base32'],
        default: 'url-encoding',
        env: 'SIGNING_PRE_ENCODING',
      },
      signingAlgorithm: {
        doc: 'Algorithm to use for signing the request',
        format: ['hmac', 'rsa', 'ecdsa'],
        default: 'hmac',
        env: 'SIGNING_ALGORITHM',
      },
      hashAlgorithm: {
        doc: 'Hash algorithm used during the signing',
        format: ['sha256', 'sha512', 'sha3-256'],
        default: 'sha256',
        env: 'SIGNING_HASH_ALGORITHM',
      },
      postEncoding: {
        doc: 'Encoding to be applied to the signature',
        format: ['url-encoding', 'base64', 'hexstr', 'base58', 'base32'],
        default: 'url-encoding',
        env: 'SIGNING_POST_ENCODING',
      },
    },
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
    generatedClientLocation: {
      doc: 'The directory containing the code generated from the OpenAPI spec',
      default: 'src/client/generated',
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

config.getUnifiedOpenApiPathname = () =>
  path.join(config.get('openApi').location, config.get('openApi').unifiedFilename);

export default config;
