import convict from 'convict';
import path from 'path';
import fs from 'fs';
import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

export const encodingTypes = ['url-encoding', 'base64', 'hexstr', 'base58', 'base32'];

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
  capabilities: {
    version: {
      doc: 'Version of the API used',
      format: String,
      default: '0.0.1',
      env: 'CAPABILITIES_VERSION',
    },
    components: {
      accounts: {
        format: capabilitiesComponent,
        default: '*',
        env: 'CAPABILITIES_ACCOUNTS',
      },
      balances: {
        format: capabilitiesComponent,
        default: '*',
        env: 'CAPABILITIES_BALANCES',
      },
      historicBalances: {
        format: capabilitiesComponent,
        default: '*',
        env: 'CAPABILITIES_HISTORIC_BALANCES',
      },
      transfers: {
        format: capabilitiesComponent,
        default: '*',
        env: 'CAPABILITIES_TRANSFERS',
      },
      transfersBlockchain: {
        format: capabilitiesComponent,
        default: '*',
        env: 'CAPABILITIES_TRANSFERS_BLOCKCHAIN',
      },
      transfersFiat: {
        format: capabilitiesComponent,
        default: '*',
        env: 'CAPABILITIES_TRANSFERS_FIAT',
      },
      transfersPeerAccounts: {
        format: capabilitiesComponent,
        default: '*',
        env: 'CAPABILITIES_TRANSFERS_PEER_ACCOUNTS',
      },
      trading: {
        format: capabilitiesComponent,
        default: '*',
        env: 'CAPABILITIES_TRADING',
      },
      liquidity: {
        format: capabilitiesComponent,
        default: '*',
        env: 'CAPABILITIES_LIQUIDITY',
      },
      subscriptions: {
        format: capabilitiesComponent,
        default: '*',
        env: 'CAPABILITIES_SUBSCRIPTIONS',
      },
    },
  },
  authentication: {
    apiKey: {
      doc: 'API key used for identification',
      env: 'API_KEY',
      format: String,
      default: null,
    },
    requestTTL: {
      doc: 'Request time to live (TTL) in seconds, which is expressed by the time that has passed since the timestamp recorded in X-FBAPI-TIMESTAMP header',
      env: 'REQUEST_TTL',
      format: Number,
      default: 10,
    },
    signing: {
      privateKey: {
        doc: 'Raw string of private key to sign requests. For RSA and ECDSA in pem format',
        env: 'SIGNING_PRIVATE_KEY',
        format: String,
        // 78965 Used only for testing
        default:
          '-----BEGIN RSA PRIVATE KEY-----\nMIIEpQIBAAKCAQEAxjjIY3iOVBy3QTKhr0Ke6fx/LvwzUpt7P9803b1fnmyxIJzK\nxC17cS/AbDVA2p3SjaYtf9Ad6LmL/GVIZFhA935O+nMECcowebuo5Uc5wMIL/KLS\nKEBIQzxmZSkquJOyarXv3FTuxvNYXeUwViatts3El/czGpnvRQsdqHZIM0cp/GUl\nl5MvDi1WKpIHFKpAK/iVB4Siz3DvD+j/ZU105tJFOl/eK6qCRoLKKx+j/lb7/O8b\nCU4EsT8zAJeui6mmTXqbZacHhFe377JKM5Nw3oH3378C9n++7hwLcu4y2pgQya57\nedf7ISKFJoR0zSpib7rjL8GfQIDZS/FO/KcnIwIDAQABAoIBAQCJw3UiDOt+cea7\nHWFZ2Udw/9e04/sXcpAaOBsZ8T+/b3M7Yz1ZUvL0G2f0zJ4iUoW/hLsilZXz5ODx\nrcK+WsfsOpDRZ5Zq52cBc/dSQkpVOYfzMYY2C1ctw5C2xgG2/o+FsqTd0PmStBW6\nTEtn1MHuxtvXcirGVi4BIlSefHZ5i8WZ+gKD3/Q0Z/coMIIAdSsuDtvMOZaK6v2E\nnYL3Szee+4Z32P+5ElOAjVHWLuGkDTVTseUEP3xvDsU2BsE1HDZ5hFCjmUQkTmWT\nX8BHfJYIUz+45XTbTsEuEgeQDGoPU97IA+/Rffc+bb1hCm3aGjCmGB2IqFT0LhQ9\nUuwrXEOhAoGBAPdJ9F29aB3z8vxLVoWgje6w8y0+FSICfKsgmX31mztMOSz39H1x\n8bFq9Xfo/NPP7kwWIFjjaoW303P2y7Sv0QF5dgTFUAvUC26AI9UyxSoX227WKwff\n2K4aGgzagZRX2IYr7w7axXhv9av521CP9DKxSXv5MgwrYzAIrRjDT8DVAoGBAM00\nV6pvenMTdcAYhJTlFhIE0q0Usl7wsQrbFRmtqorXNrTTeZD1sRnzwqJ54wLLNAyt\nxpfwCr7O6Y2Bpbdhg9KL4XWw5ex7bddxdcBjinZ/6mhTW0td2sVlq/KUFd9lBDYh\nXQAA/i7Pc96N8MCTC/7G6hChp05l1LSY0HecU4QXAoGBAJACu5LTuQyogrs2zJ5p\nT/7Pge65FumFdUDbbUgTfmFcFHgBtppPfyeJWIaKYqKflvEseY4KcoCI+1WvRhZl\nxVwMdhR1LBaXWEjzyupf9L58wkeb5ddiHvfVL5KItanENs58S23lLdbjrLiIe5ZB\nHz9eS6MtDl5T7iGNC/E93PY5AoGBAK/dpzBrwC71w5nxqVcOiv7AYWpy7XgOojzi\njE/oldvOHJWXFH3XA4RxdCLZgWQ4kRA4spYu5JapMGLVdRgYG+kLdxvtkvA8zGOz\nWq6a4OU0NcpZfkm2UzOQMnCA18oQgi5+I31IXI/zvaNEVMxGeiZNhfbhBEldXpG0\n0h1gvfbbAoGAB0wL5v7KaCB2HgS8/aQnm0HB1fNxqoGGFe9fo1D8ZybFT8dv39aE\n89LvxTB2Vqe7jtNF2aZQBMVlE4J5z046tCxFaRfW/VxBzktXZobViFj38rDIjcch\n16lU3hp5P19DSGRcYOmQHj37CS9vyk/i94lF/aysGFRKIdVGbROLPT0=\n-----END RSA PRIVATE KEY-----\n',
      },
      preEncoding: {
        doc: 'Encoding to be applied to the data before it is signed',
        format: encodingTypes,
        default: 'url-encoding',
        env: 'SIGNING_PRE_ENCODING',
      },
      signingAlgorithm: {
        doc: 'Algorithm to use for signing the request',
        format: ['hmac', 'rsa', 'ecdsa'],
        default: 'rsa',
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
        format: encodingTypes,
        default: 'url-encoding',
        env: 'SIGNING_POST_ENCODING',
      },
    },
  },
  openApi: {
    location: {
      doc: 'The directory where the OpenAPI files are located',
      format: filename,
      default: '../openapi',
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
      default: 'fb-unified-openapi.yaml',
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

function isStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return false;
  }

  if (value.find((item) => typeof item !== 'string')) {
    return false;
  }

  return true;
}

function capabilitiesComponent(value: unknown) {
  if (value == undefined) {
    return;
  }

  if (value === '*' || isStringArray(value)) {
    return;
  }

  throw new Error(`Configuration error: invalid capabilities component format: ${value}`);
}

const filePath = path.join(__dirname, `${config.get('env')}.json`);
if (fs.existsSync(filePath)) {
  config.loadFile(filePath);
}

config.validate({ allowed: 'strict' });

config.getUnifiedOpenApiPathname = () =>
  path.join(config.get('openApi').location, config.get('openApi').unifiedFilename);

export default config;
