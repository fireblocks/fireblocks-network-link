import convict from 'convict';
import path from 'path';
import fs from 'fs';
import { config as dotenvConfig } from 'dotenv';
import {
  CryptocurrencySymbol,
  Blockchain,
  InternalTransferDestinationPolicy,
  PublicBlockchainCapability,
} from '../client/generated';

dotenvConfig();

export const encodingTypes = ['url-encoded', 'base64', 'hexstr', 'base58', 'base32'];

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
      default: 'http://0.0.0.0:8000/v2',
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
  paginationLimit: {
    format: Number,
    default: 2,
    env: 'PAGINATION_LIMIT',
  },
  collateral: {
    signers: {
      userId: {
        format: Array<string>,
        default: ['be5ff76b-6cc8-4a39-af40-fc71aea1865c', 'c5bb0880-523c-4c1c-bfe7-bcf2941517a0'],
        env: 'COLLATERAL_SIGNERS',
      },
    },
    collateralAccount: {
      accountId: {
        format: String,
        default:
          'c8dd0660-555c-4c1c-bfe7-bcf2941517a0.be5ff76b-6cc8-4a39-af40-fc71aea1865c.c5bb0880-523c-4c1c-bfe7-bcf2941517a0',
        env: 'COLLATERAL_ACCOUNT',
      },
    },
    withdrawal: {
      address: {
        format: String,
        default: 'J4NOFD4VBNJ35F2MEII4HRAADNPJ7QFYAKESYKSEWWGJUXG64IATUVZRMQ',
        env: 'COLLATERAL_WITHDRAWAL_ADDRESS',
      },
      addressTag: {
        format: String,
        default: '5494396EB65E6615D307',
        env: 'COLLATERAL_WITHDRAWAL_ADDRESS_TAG',
      },
      transferMethod: {
        blockchain: {
          format: Object.values(PublicBlockchainCapability.transferMethod),
          default: PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN,
          env: 'COLLATERAL_TRANSFER_METHOD_BLOCKCHAIN',
        },
      },
    },
    asset: {
      symbol: {
        format: Object.values(CryptocurrencySymbol),
        default: CryptocurrencySymbol.KAVA,
        env: 'COLLATERAL_DEPOSIT_ASSET_SYMBOL',
      },
      assetId: {
        format: String,
        default: '',
        env: 'COLLATERAL_DEPOSIT_ASSET_ID',
      },
      blockchain: {
        format: Object.values(Blockchain),
        default: Blockchain.FLARE,
        env: 'COLLATERAL_DEPOSIT_ASSET_BLOCKCHAIN',
      },
      testAsset: {
        format: Boolean,
        default: true,
        env: 'COLLATERAL_DEPOSIT_ASSET_TEST',
      },
    },
  },
  withdrawal: {
    peerAccount: {
      accountId: {
        format: String,
        default: 'be5ff76b-6cc8-4a39-af40-fc71aea1865c',
        env: 'WITHDRAWAL_PEER_ACCOUNT',
      },
    },
    subAccount: {
      accountId: {
        format: String,
        default: 'c5bb0880-523c-4c1c-bfe7-bcf2941517a0',
        env: 'WITHDRAWAL_SUB_ACCOUNT',
      },
      destinationPolicy: {
        format: Object.values(InternalTransferDestinationPolicy),
        default: InternalTransferDestinationPolicy.ANY_ACCOUNT,
        env: 'WITHDRAWAL_INTERNAL_TRANSFER_DESTINATION_POLICY',
      },
    },
    blockchain: {
      address: {
        format: String,
        default: '0x91b9e7bc95f8ef6f4e08ea10aaaac84b6c54203b',
        env: 'WITHDRAWAL_BLOCKCHAIN_ADDRESS',
      },
      addressTag: {
        format: String,
        default: undefined,
        env: 'WITHDRAWAL_BLOCKCHAIN_ADDRESS_TAG',
      },
    },
    iban: {
      accountHolder: {
        name: {
          format: String,
          default: 'John Doe',
          env: 'WITHDRAWAL_IBAN_ACCOUNT_NAME',
        },
        city: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_IBAN_ACCOUNT_CITY',
        },
        country: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_IBAN_ACCOUNT_COUNTRY',
        },
        subdivision: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_IBAN_ACCOUNT_SUBDIVISION',
        },
        address: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_IBAN_ACCOUNT_ADDRESS',
        },
        postalCode: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_IBAN_ACCOUNT_POSTAL_CODE',
        },
      },
      iban: {
        format: String,
        default: 'LO16MVPcSq8',
        env: 'WITHDRAWAL_IBAN_IBAN',
      },
    },
    swift: {
      accountHolder: {
        name: {
          format: String,
          default: 'John Doe',
          env: 'WITHDRAWAL_SWIFT_ACCOUNT_NAME',
        },
        city: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_SWIFT_ACCOUNT_CITY',
        },
        country: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_SWIFT_ACCOUNT_COUNTRY',
        },
        subdivision: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_SWIFT_ACCOUNT_SUBDIVISION',
        },
        address: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_SWIFT_ACCOUNT_ADDRESS',
        },
        postalCode: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_SWIFT_ACCOUNT_POSTAL_CODE',
        },
      },
      swiftCode: {
        format: String,
        default: 'KPKUJWXMLDB',
        env: 'WITHDRAWAL_SWIFT_CODE',
      },
      routingNumber: {
        format: String,
        default: '8d73hc7sj8',
        env: 'WITHDRAWAL_SWIFT_ROUTING_NUMBER',
      },
    },
    ach: {
      accountHolder: {
        name: {
          format: String,
          default: 'John Doe',
          env: 'WITHDRAWAL_ACH_ACCOUNT_NAME',
        },
        city: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_ACH_ACCOUNT_CITY',
        },
        country: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_ACH_ACCOUNT_COUNTRY',
        },
        subdivision: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_ACH_ACCOUNT_SUBDIVISION',
        },
        address: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_ACH_ACCOUNT_ADDRESS',
        },
        postalCode: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_ACH_ACCOUNT_POSTAL_CODE',
        },
      },
      bankName: {
        format: String,
        default: 'Chase',
        env: 'WITHDRAWAL_ACH_BANK_NAME',
      },
      bankAccountNumber: {
        format: String,
        default: '12345678901',
        env: 'WITHDRAWAL_ACH_BANK_ACCOUNT_NUMBER',
      },
      routingNumber: {
        format: String,
        default: '123456789',
        env: 'WITHDRAWAL_ACH_ROUTING_NUMBER',
      },
      accountType: {
        format: String,
        default: 'checking',
        env: 'WITHDRAWAL_ACH_ACCOUNT_TYPE',
      },
    },
    spei: {
      accountHolder: {
        name: {
          format: String,
          default: 'Juan Pérez',
          env: 'WITHDRAWAL_SPEI_ACCOUNT_NAME',
        },
        city: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_SPEI_ACCOUNT_CITY',
        },
        country: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_SPEI_ACCOUNT_COUNTRY',
        },
        subdivision: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_SPEI_ACCOUNT_SUBDIVISION',
        },
        address: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_SPEI_ACCOUNT_ADDRESS',
        },
        postalCode: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_SPEI_ACCOUNT_POSTAL_CODE',
        },
      },
      bankName: {
        format: String,
        default: 'Banamex',
        env: 'WITHDRAWAL_SPEI_BANK_NAME',
      },
      bankAccountNumber: {
        format: String,
        default: '002010077777777771',
        env: 'WITHDRAWAL_SPEI_BANK_ACCOUNT_NUMBER',
      },
    },
    wire: {
      accountHolder: {
        name: {
          format: String,
          default: 'John Doe',
          env: 'WITHDRAWAL_WIRE_ACCOUNT_NAME',
        },
        city: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_WIRE_ACCOUNT_CITY',
        },
        country: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_WIRE_ACCOUNT_COUNTRY',
        },
        subdivision: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_WIRE_ACCOUNT_SUBDIVISION',
        },
        address: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_WIRE_ACCOUNT_ADDRESS',
        },
        postalCode: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_WIRE_ACCOUNT_POSTAL_CODE',
        },
      },
      bankName: {
        format: String,
        default: 'Chase',
        env: 'WITHDRAWAL_WIRE_BANK_NAME',
      },
      bankAccountNumber: {
        format: String,
        default: '12345678901',
        env: 'WITHDRAWAL_WIRE_BANK_ACCOUNT_NUMBER',
      },
      routingNumber: {
        format: String,
        default: '123456789',
        env: 'WITHDRAWAL_WIRE_ROUTING_NUMBER',
      },
      bankAddress: {
        format: String,
        default: '270 Park Ave, New York, NY 10017',
        env: 'WITHDRAWAL_WIRE_BANK_ADDRESS',
      },
    },
    clabe: {
      accountHolder: {
        name: {
          format: String,
          default: 'John Doe',
          env: 'WITHDRAWAL_CLABE_ACCOUNT_NAME',
        },
        city: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_CLABE_ACCOUNT_CITY',
        },
        country: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_CLABE_ACCOUNT_COUNTRY',
        },
        subdivision: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_CLABE_ACCOUNT_SUBDIVISION',
        },
        address: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_CLABE_ACCOUNT_ADDRESS',
        },
        postalCode: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_CLABE_ACCOUNT_POSTAL_CODE',
        },
      },
      clabe: {
        format: String,
        default: '002010077777777771',
        env: 'WITHDRAWAL_CLABE_NUMBER',
      },
      bankName: {
        format: String,
        default: 'Chase',
        env: 'WITHDRAWAL_CLABE_BANK_NAME',
      },
      beneficiaryRfc: {
        format: String,
        default: '12345678901234567890123456789012',
        env: 'WITHDRAWAL_CLABE_BENEFICIARY_RFC',
      },
    },
    pix: {
      accountHolder: {
        name: {
          format: String,
          default: 'John Doe',
          env: 'WITHDRAWAL_PIX_ACCOUNT_NAME',
        },
        city: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_PIX_ACCOUNT_CITY',
        },
        country: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_PIX_ACCOUNT_COUNTRY',
        },
        subdivision: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_PIX_ACCOUNT_SUBDIVISION',
        },
        address: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_PIX_ACCOUNT_ADDRESS',
        },
        postalCode: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_PIX_ACCOUNT_POSTAL_CODE',
        },
      },
      pixKey: {
        format: String,
        default: '12345678901234567890123456789012',
        env: 'WITHDRAWAL_PIX_KEY',
      },
      keyType: {
        format: String,
        default: 'email',
        env: 'WITHDRAWAL_PIX_KEY_TYPE',
      },
      bankName: {
        format: String,
        default: 'Chase',
        env: 'WITHDRAWAL_PIX_BANK_NAME',
      },
      bankAccountNumber: {
        format: String,
        default: '12345678901',
        env: 'WITHDRAWAL_PIX_BANK_ACCOUNT_NUMBER',
      },
    },
    europeanSepa: {
      accountHolder: {
        name: {
          format: String,
          default: 'John Doe',
          env: 'WITHDRAWAL_EUROPEAN_SEPA_ACCOUNT_NAME',
        },
        city: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_EUROPEAN_SEPA_ACCOUNT_CITY',
        },
        country: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_EUROPEAN_SEPA_ACCOUNT_COUNTRY',
        },
        subdivision: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_EUROPEAN_SEPA_ACCOUNT_SUBDIVISION',
        },
        address: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_EUROPEAN_SEPA_ACCOUNT_ADDRESS',
        },
        postalCode: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_EUROPEAN_SEPA_ACCOUNT_POSTAL_CODE',
        },
      },
      iban: {
        format: String,
        default: '12345678901234567890123456789012',
        env: 'WITHDRAWAL_EUROPEAN_SEPA_IBAN',
      },
      bic: {
        format: String,
        default: '12345678901234567890123456789012',
        env: 'WITHDRAWAL_EUROPEAN_SEPA_BIC',
      },
      bankName: {
        format: String,
        default: 'Chase',
        env: 'WITHDRAWAL_EUROPEAN_SEPA_BANK_NAME',
      },
      bankBranch: {
        format: String,
        default: '12345678901',
        env: 'WITHDRAWAL_EUROPEAN_SEPA_BANK_BRANCH',
      },
      bankAddress: {
        format: String,
        default: '12345678901',
        env: 'WITHDRAWAL_EUROPEAN_SEPA_BANK_ADDRESS',
      },
      purposeCode: {
        format: String,
        default: '12345678901',
        env: 'WITHDRAWAL_EUROPEAN_SEPA_PURPOSE_CODE',
      },
      taxId: {
        format: String,
        default: '12345678901',
        env: 'WITHDRAWAL_EUROPEAN_SEPA_TAX_ID',
      },
    },
    aba: {
      accountHolder: {
        name: {
          format: String,
          default: 'John Doe',
          env: 'WITHDRAWAL_ABA_ACCOUNT_NAME',
        },
        city: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_ABA_ACCOUNT_CITY',
        },
        country: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_ABA_ACCOUNT_COUNTRY',
        },
        subdivision: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_ABA_ACCOUNT_SUBDIVISION',
        },
        address: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_ABA_ACCOUNT_ADDRESS',
        },
        postalCode: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_ABA_ACCOUNT_POSTAL_CODE',
        },
      },
      accountNumber: {
        format: String,
        default: '12345678901',
        env: 'WITHDRAWAL_ABA_ACCOUNT_NUMBER',
      },
      routingNumber: {
        format: String,
        default: '123456789',
        env: 'WITHDRAWAL_ABA_ROUTING_NUMBER',
      },
      swiftCode: {
        format: String,
        default: '123456789',
        env: 'WITHDRAWAL_ABA_SWIFT_CODE',
      },
      bankName: {
        format: String,
        default: 'Chase',
        env: 'WITHDRAWAL_ABA_BANK_NAME',
      },
      bankAddress: {
        streetName: {
          format: String,
          default: '123 Main St',
          env: 'WITHDRAWAL_ABA_BANK_ADDRESS_STREET_NAME',
        },
        buildingNumber: {
          format: String,
          default: '123',
          env: 'WITHDRAWAL_ABA_BANK_ADDRESS_BUILDING_NUMBER',
        },
        postalCode: {
          format: String,
          default: '12345',
          env: 'WITHDRAWAL_ABA_BANK_ADDRESS_POSTAL_CODE',
        },
        city: {
          format: String,
          default: 'New York',
          env: 'WITHDRAWAL_ABA_BANK_ADDRESS_CITY',
        },
        subdivision: {
          format: String,
          default: 'NY',
          env: 'WITHDRAWAL_ABA_BANK_ADDRESS_SUBDIVISION',
        },
        district: {
          format: String,
          default: 'NY',
          env: 'WITHDRAWAL_ABA_BANK_ADDRESS_DISTRICT',
        },
        country: {
          format: String,
          default: 'US',
          env: 'WITHDRAWAL_ABA_BANK_ADDRESS_COUNTRY',
        },
      },
      branchNumber: {
        format: String,
        default: '123456789',
        env: 'WITHDRAWAL_ABA_BRANCH_NUMBER',
      },
    },
    mobileMoney: {
      accountHolder: {
        name: {
          format: String,
          default: 'John Doe',
          env: 'WITHDRAWAL_MOBILE_MONEY_ACCOUNT_NAME',
        },
        city: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_MOBILE_MONEY_ACCOUNT_CITY',
        },
        country: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_MOBILE_MONEY_ACCOUNT_COUNTRY',
        },
        subdivision: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_MOBILE_MONEY_ACCOUNT_SUBDIVISION',
        },
        address: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_MOBILE_MONEY_ACCOUNT_ADDRESS',
        },
        postalCode: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_MOBILE_MONEY_ACCOUNT_POSTAL_CODE',
        },
      },
      mobilePhoneNumber: {
        format: String,
        default: '12345678901',
        env: 'WITHDRAWAL_MOBILE_MONEY_MOBILE_PHONE_NUMBER',
      },
      provider: {
        format: String,
        default: 'orange',
        env: 'WITHDRAWAL_MOBILE_MONEY_PROVIDER',
      },
      beneficiaryDocumentId: {
        format: String,
        default: '12345678901',
        env: 'WITHDRAWAL_MOBILE_MONEY_BENEFICIARY_DOCUMENT_ID',
      },
      beneficiaryRelationship: {
        format: String,
        default: 'self',
        env: 'WITHDRAWAL_MOBILE_MONEY_BENEFICIARY_RELATIONSHIP',
      },
    },
    localBankTransfer: {
      accountHolder: {
        name: {
          format: String,
          default: 'John Doe',
          env: 'WITHDRAWAL_LOCAL_BANK_TRANSFER_ACCOUNT_NAME',
        },
        city: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_LOCAL_BANK_TRANSFER_ACCOUNT_CITY',
        },
        country: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_LOCAL_BANK_TRANSFER_ACCOUNT_COUNTRY',
        },
        subdivision: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_LOCAL_BANK_TRANSFER_ACCOUNT_SUBDIVISION',
        },
        address: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_LOCAL_BANK_TRANSFER_ACCOUNT_ADDRESS',
        },
        postalCode: {
          format: String,
          default: undefined,
          env: 'WITHDRAWAL_LOCAL_BANK_TRANSFER_ACCOUNT_POSTAL_CODE',
        },
      },
      accountNumber: {
        format: String,
        default: '12345678901',
        env: 'WITHDRAWAL_LOCAL_BANK_TRANSFER_ACCOUNT_NUMBER',
      },
      bankName: {
        format: String,
        default: 'Chase',
        env: 'WITHDRAWAL_LOCAL_BANK_TRANSFER_BANK_NAME',
      },
      bankCode: {
        format: String,
        default: '123456789',
        env: 'WITHDRAWAL_LOCAL_BANK_TRANSFER_BANK_CODE',
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
        // 78965 Used only for testing test
        default:
          '-----BEGIN RSA PRIVATE KEY-----\nMIIEpQIBAAKCAQEAxjjIY3iOVBy3QTKhr0Ke6fx/LvwzUpt7P9803b1fnmyxIJzK\nxC17cS/AbDVA2p3SjaYtf9Ad6LmL/GVIZFhA935O+nMECcowebuo5Uc5wMIL/KLS\nKEBIQzxmZSkquJOyarXv3FTuxvNYXeUwViatts3El/czGpnvRQsdqHZIM0cp/GUl\nl5MvDi1WKpIHFKpAK/iVB4Siz3DvD+j/ZU105tJFOl/eK6qCRoLKKx+j/lb7/O8b\nCU4EsT8zAJeui6mmTXqbZacHhFe377JKM5Nw3oH3378C9n++7hwLcu4y2pgQya57\nedf7ISKFJoR0zSpib7rjL8GfQIDZS/FO/KcnIwIDAQABAoIBAQCJw3UiDOt+cea7\nHWFZ2Udw/9e04/sXcpAaOBsZ8T+/b3M7Yz1ZUvL0G2f0zJ4iUoW/hLsilZXz5ODx\nrcK+WsfsOpDRZ5Zq52cBc/dSQkpVOYfzMYY2C1ctw5C2xgG2/o+FsqTd0PmStBW6\nTEtn1MHuxtvXcirGVi4BIlSefHZ5i8WZ+gKD3/Q0Z/coMIIAdSsuDtvMOZaK6v2E\nnYL3Szee+4Z32P+5ElOAjVHWLuGkDTVTseUEP3xvDsU2BsE1HDZ5hFCjmUQkTmWT\nX8BHfJYIUz+45XTbTsEuEgeQDGoPU97IA+/Rffc+bb1hCm3aGjCmGB2IqFT0LhQ9\nUuwrXEOhAoGBAPdJ9F29aB3z8vxLVoWgje6w8y0+FSICfKsgmX31mztMOSz39H1x\n8bFq9Xfo/NPP7kwWIFjjaoW303P2y7Sv0QF5dgTFUAvUC26AI9UyxSoX227WKwff\n2K4aGgzagZRX2IYr7w7axXhv9av521CP9DKxSXv5MgwrYzAIrRjDT8DVAoGBAM00\nV6pvenMTdcAYhJTlFhIE0q0Usl7wsQrbFRmtqorXNrTTeZD1sRnzwqJ54wLLNAyt\nxpfwCr7O6Y2Bpbdhg9KL4XWw5ex7bddxdcBjinZ/6mhTW0td2sVlq/KUFd9lBDYh\nXQAA/i7Pc96N8MCTC/7G6hChp05l1LSY0HecU4QXAoGBAJACu5LTuQyogrs2zJ5p\nT/7Pge65FumFdUDbbUgTfmFcFHgBtppPfyeJWIaKYqKflvEseY4KcoCI+1WvRhZl\nxVwMdhR1LBaXWEjzyupf9L58wkeb5ddiHvfVL5KItanENs58S23lLdbjrLiIe5ZB\nHz9eS6MtDl5T7iGNC/E93PY5AoGBAK/dpzBrwC71w5nxqVcOiv7AYWpy7XgOojzi\njE/oldvOHJWXFH3XA4RxdCLZgWQ4kRA4spYu5JapMGLVdRgYG+kLdxvtkvA8zGOz\nWq6a4OU0NcpZfkm2UzOQMnCA18oQgi5+I31IXI/zvaNEVMxGeiZNhfbhBEldXpG0\n0h1gvfbbAoGAB0wL5v7KaCB2HgS8/aQnm0HB1fNxqoGGFe9fo1D8ZybFT8dv39aE\n89LvxTB2Vqe7jtNF2aZQBMVlE4J5z046tCxFaRfW/VxBzktXZobViFj38rDIjcch\n16lU3hp5P19DSGRcYOmQHj37CS9vyk/i94lF/aysGFRKIdVGbROLPT0=\n-----END RSA PRIVATE KEY-----\n',
      },
      preEncoding: {
        doc: 'Encoding to be applied to the data before it is signed',
        format: encodingTypes,
        default: 'url-encoded',
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
        default: 'url-encoded',
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
        'fb-provider-collateral-api.yaml',
        'fb-provider-ramp-api.yaml',
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
  mockServerCapabilitiesDir: {
    doc: 'The directory where the mock server capabilities are defined. If not set, will be randomly generated',
    format: String,
    default: 'capability-presets/all-capabilities',
    env: 'CAPABILITIES_DIR',
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
