import {
  AlgorithmNotSupportedError,
  HashAlgorithm,
  SigningAlgorithm,
  signerFactory,
} from '../../src/security/signing';

const data = 'data';

// 78965 Used only for testing
const ecdsaPrivateKey = `-----BEGIN EC PRIVATE KEY-----
  MHcCAQEEILQYC64rX4hZrYhCCoTmxLKSCqPYd530UoV69DWu5xPmoAoGCCqGSM49
  AwEHoUQDQgAEU07Yntilfgln/MSCpWH6rMcwyiZzff7SYxgxIuOv/t5LpR5vfY7A
  1PlkFOKzV/bvobG+ZpT+mGWE8kmyiqZ20A==
  -----END EC PRIVATE KEY-----
  `;

// 78965 Used only for testing
const ecdsaPublicKey = `-----BEGIN PUBLIC KEY-----
  MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEU07Yntilfgln/MSCpWH6rMcwyiZz
  ff7SYxgxIuOv/t5LpR5vfY7A1PlkFOKzV/bvobG+ZpT+mGWE8kmyiqZ20A==
  -----END PUBLIC KEY-----
  `;

// 78965 Used only for testing
const rsaPrivateKey = `-----BEGIN RSA PRIVATE KEY-----
  MIIEpQIBAAKCAQEAxjjIY3iOVBy3QTKhr0Ke6fx/LvwzUpt7P9803b1fnmyxIJzK
  xC17cS/AbDVA2p3SjaYtf9Ad6LmL/GVIZFhA935O+nMECcowebuo5Uc5wMIL/KLS
  KEBIQzxmZSkquJOyarXv3FTuxvNYXeUwViatts3El/czGpnvRQsdqHZIM0cp/GUl
  l5MvDi1WKpIHFKpAK/iVB4Siz3DvD+j/ZU105tJFOl/eK6qCRoLKKx+j/lb7/O8b
  CU4EsT8zAJeui6mmTXqbZacHhFe377JKM5Nw3oH3378C9n++7hwLcu4y2pgQya57
  edf7ISKFJoR0zSpib7rjL8GfQIDZS/FO/KcnIwIDAQABAoIBAQCJw3UiDOt+cea7
  HWFZ2Udw/9e04/sXcpAaOBsZ8T+/b3M7Yz1ZUvL0G2f0zJ4iUoW/hLsilZXz5ODx
  rcK+WsfsOpDRZ5Zq52cBc/dSQkpVOYfzMYY2C1ctw5C2xgG2/o+FsqTd0PmStBW6
  TEtn1MHuxtvXcirGVi4BIlSefHZ5i8WZ+gKD3/Q0Z/coMIIAdSsuDtvMOZaK6v2E
  nYL3Szee+4Z32P+5ElOAjVHWLuGkDTVTseUEP3xvDsU2BsE1HDZ5hFCjmUQkTmWT
  X8BHfJYIUz+45XTbTsEuEgeQDGoPU97IA+/Rffc+bb1hCm3aGjCmGB2IqFT0LhQ9
  UuwrXEOhAoGBAPdJ9F29aB3z8vxLVoWgje6w8y0+FSICfKsgmX31mztMOSz39H1x
  8bFq9Xfo/NPP7kwWIFjjaoW303P2y7Sv0QF5dgTFUAvUC26AI9UyxSoX227WKwff
  2K4aGgzagZRX2IYr7w7axXhv9av521CP9DKxSXv5MgwrYzAIrRjDT8DVAoGBAM00
  V6pvenMTdcAYhJTlFhIE0q0Usl7wsQrbFRmtqorXNrTTeZD1sRnzwqJ54wLLNAyt
  xpfwCr7O6Y2Bpbdhg9KL4XWw5ex7bddxdcBjinZ/6mhTW0td2sVlq/KUFd9lBDYh
  XQAA/i7Pc96N8MCTC/7G6hChp05l1LSY0HecU4QXAoGBAJACu5LTuQyogrs2zJ5p
  T/7Pge65FumFdUDbbUgTfmFcFHgBtppPfyeJWIaKYqKflvEseY4KcoCI+1WvRhZl
  xVwMdhR1LBaXWEjzyupf9L58wkeb5ddiHvfVL5KItanENs58S23lLdbjrLiIe5ZB
  Hz9eS6MtDl5T7iGNC/E93PY5AoGBAK/dpzBrwC71w5nxqVcOiv7AYWpy7XgOojzi
  jE/oldvOHJWXFH3XA4RxdCLZgWQ4kRA4spYu5JapMGLVdRgYG+kLdxvtkvA8zGOz
  Wq6a4OU0NcpZfkm2UzOQMnCA18oQgi5+I31IXI/zvaNEVMxGeiZNhfbhBEldXpG0
  0h1gvfbbAoGAB0wL5v7KaCB2HgS8/aQnm0HB1fNxqoGGFe9fo1D8ZybFT8dv39aE
  89LvxTB2Vqe7jtNF2aZQBMVlE4J5z046tCxFaRfW/VxBzktXZobViFj38rDIjcch
  16lU3hp5P19DSGRcYOmQHj37CS9vyk/i94lF/aysGFRKIdVGbROLPT0=
  -----END RSA PRIVATE KEY-----
  `;

// 78965 Used only for testing
const rsaPublicKey = `-----BEGIN PUBLIC KEY-----
  MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxjjIY3iOVBy3QTKhr0Ke
  6fx/LvwzUpt7P9803b1fnmyxIJzKxC17cS/AbDVA2p3SjaYtf9Ad6LmL/GVIZFhA
  935O+nMECcowebuo5Uc5wMIL/KLSKEBIQzxmZSkquJOyarXv3FTuxvNYXeUwViat
  ts3El/czGpnvRQsdqHZIM0cp/GUll5MvDi1WKpIHFKpAK/iVB4Siz3DvD+j/ZU10
  5tJFOl/eK6qCRoLKKx+j/lb7/O8bCU4EsT8zAJeui6mmTXqbZacHhFe377JKM5Nw
  3oH3378C9n++7hwLcu4y2pgQya57edf7ISKFJoR0zSpib7rjL8GfQIDZS/FO/Kcn
  IwIDAQAB
  -----END PUBLIC KEY-----
  `;

type SigningVariation = {
  signingAlgo: SigningAlgorithm;
  hashAlgo: HashAlgorithm;
};

const supportedSigningVariations: SigningVariation[] = [
  {
    signingAlgo: 'hmac',
    hashAlgo: 'sha256',
  },
  {
    signingAlgo: 'hmac',
    hashAlgo: 'sha512',
  },
  {
    signingAlgo: 'hmac',
    hashAlgo: 'sha3-256',
  },
  {
    signingAlgo: 'rsa',
    hashAlgo: 'sha256',
  },
  {
    signingAlgo: 'rsa',
    hashAlgo: 'sha512',
  },
  {
    signingAlgo: 'rsa',
    hashAlgo: 'sha3-256',
  },
  {
    signingAlgo: 'ecdsa',
    hashAlgo: 'sha256',
  },
];

const unsupportedSigningVariations: SigningVariation[] = [
  {
    signingAlgo: 'ecdsa',
    hashAlgo: 'sha512',
  },
  {
    signingAlgo: 'ecdsa',
    hashAlgo: 'sha3-256',
  },
];

function getKeyPairForSigningAlgo(signingAlgo: string): {
  privateKey: string;
  publicKey: string;
} {
  switch (signingAlgo) {
    case 'hmac':
      return { privateKey: 'any-string-works-for-hmac', publicKey: 'any-string-works-for-hmac' };
    case 'rsa':
      return { privateKey: rsaPrivateKey, publicKey: rsaPublicKey };
    case 'ecdsa':
      return { privateKey: ecdsaPrivateKey, publicKey: ecdsaPublicKey };
    default:
      throw new Error('Invalid signing algorithm');
  }
}

describe('Signing methods', () => {
  describe.each(supportedSigningVariations)(
    '$hashAlgo ❯ $signingAlgo',
    ({ signingAlgo, hashAlgo }) => {
      it('should sign and verify successfully', () => {
        const { privateKey, publicKey } = getKeyPairForSigningAlgo(signingAlgo);
        const signature = signerFactory(signingAlgo).sign(data, privateKey, hashAlgo);
        expect(signerFactory(signingAlgo).verify(data, publicKey, signature, hashAlgo)).toBe(true);
      });
    }
  );

  describe.each(unsupportedSigningVariations)(
    '$hashAlgo ❯ $signingAlgo',
    ({ signingAlgo, hashAlgo }) => {
      it('should thow unsupported algorithm', () => {
        const { privateKey, publicKey } = getKeyPairForSigningAlgo(signingAlgo);
        expect(() => {
          signerFactory(signingAlgo).sign(data, privateKey, hashAlgo);
        }).toThrow(AlgorithmNotSupportedError);
        expect(() => {
          signerFactory(signingAlgo).verify(data, publicKey, Buffer.from('signature'), hashAlgo);
        }).toThrow(AlgorithmNotSupportedError);
      });
    }
  );
});
