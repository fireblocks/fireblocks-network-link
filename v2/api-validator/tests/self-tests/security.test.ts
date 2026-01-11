import { buildRequestSignature, verifySignature } from '../../src/security';
import config, { encodingTypes } from '../../src/config';

// 78965 Used only for testing
const ecdsaPrivateKey = `-----BEGIN EC PRIVATE KEY-----
MHcCAQEEILQYC64rX4hZrYhCCoTmxLKSCqPYd530UoV69DWu5xPmoAoGCCqGSM49
AwEHoUQDQgAEU07Yntilfgln/MSCpWH6rMcwyiZzff7SYxgxIuOv/t5LpR5vfY7A
1PlkFOKzV/bvobG+ZpT+mGWE8kmyiqZ20A==
-----END EC PRIVATE KEY-----
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

describe('Signature creation and verification', () => {
  let signature: string;
  const payload = 'payload';
  const differentPayload = 'different-payload';

  describe.each(makeSigningVariations())(
    '#️⃣  $index: $preEncoding ❯ $hashAlgorithm ❯ $signingAlgorithm ❯ $postEncoding',
    ({ signingAlgorithm, hashAlgorithm, preEncoding, postEncoding, privateKey }) => {
      beforeAll(() => {
        config.set('authentication.signing', {
          signingAlgorithm,
          hashAlgorithm,
          preEncoding,
          postEncoding,
          privateKey,
        });
        signature = buildRequestSignature(payload);
      });

      it('should verify the signature successfully on the correct payload', () => {
        expect(verifySignature(payload, signature)).toBe(true);
      });

      it('should fail the signature verification on the wrong payload', () => {
        expect(verifySignature(differentPayload, signature)).toBe(false);
      });
    }
  );
});

type SigningVariation = {
  index: number;
  preEncoding: string;
  postEncoding: string;
  signingAlgorithm: string;
  hashAlgorithm: string;
  privateKey: string;
};

function makeSigningVariations(): SigningVariation[] {
  const variations: SigningVariation[] = [];

  const algorithmVariations = [
    ['hmac', 'sha256'],
    ['hmac', 'sha512'],
    ['hmac', 'sha3-256'],
    ['rsa', 'sha256'],
    ['rsa', 'sha512'],
    ['rsa', 'sha3-256'],
    ['ecdsa', 'sha256'],
  ];

  let index = 0;
  for (const [signingAlgorithm, hashAlgorithm] of algorithmVariations) {
    for (const preEncoding of encodingTypes) {
      for (const postEncoding of encodingTypes) {
        index++;
        variations.push({
          index,
          signingAlgorithm,
          hashAlgorithm,
          preEncoding,
          postEncoding,
          privateKey: getPrivateKeyForAlgo(signingAlgorithm),
        });
      }
    }
  }

  return variations;
}

function getPrivateKeyForAlgo(algorithm: string): string {
  switch (algorithm) {
    case 'hmac':
      return 'any-string-works-for-hmac';
    case 'rsa':
      return rsaPrivateKey;
    case 'ecdsa':
      return ecdsaPrivateKey;
    default:
      throw new Error('Invalid signing algorithm');
  }
}

describe('Signature creation and verification with real payload', () => {
  const timestamp = '1765796851069';
  const nonce = '930de02e-6b6a-4b9b-9d61-132a12f98b90';
  const endpoint = '/accounts/f30f1401-ed1d-4d6e-975f-425cf05b1ed4/ramps';
  const method = 'POST';

  const bodyObjWithUnicode = {
    idempotencyKey: 'e8f3e0cb-388f-4293-8779-f2f61eac21f8',
    amount: '1000',
    participantsIdentification: {
      originator: {
        entityType: 'Individual',
        participantRelationshipType: 'ThirdParty',
        fullName: { firstName: 'Kassa', lastName: 'Loïc' },
        dateOfBirth: '1997-03-04',
        postalAddress: {
          streetName: 'Main Street',
          buildingNumber: '123',
          postalCode: '10001',
          city: 'Benin',
          subdivision: 'District',
          district: 'Abomey-Calavi',
          country: 'BJ',
        },
      },
      beneficiary: {
        entityType: 'Individual',
        participantRelationshipType: 'ThirdParty',
        fullName: { firstName: 'Maor', lastName: 'Keinan' },
        dateOfBirth: '1986-05-26',
        postalAddress: {
          streetName: 'Yitzhak Sade',
          buildingNumber: '8',
          postalCode: '6777508',
          city: 'Tel Aviv',
          subdivision: 'District',
          country: 'IL',
        },
      },
    },
    type: 'OnRamp',
    from: { asset: { nationalCurrencyCode: 'USD', testAsset: false }, transferMethod: 'Wire' },
    to: {
      asset: { cryptocurrencySymbol: 'ETH', blockchain: 'Ethereum', testAsset: false },
      transferMethod: 'PublicBlockchain',
      address: '',
    },
  };

  const bodyObjWithRegular = {
    ...bodyObjWithUnicode,
    participantsIdentification: {
      ...bodyObjWithUnicode.participantsIdentification,
      originator: {
        ...bodyObjWithUnicode.participantsIdentification.originator,
        fullName: { firstName: 'Kassa', lastName: 'Loic' },
      },
    },
  };

  const payloadWithUnicode = `${timestamp}${nonce}${method}${endpoint}${JSON.stringify(
    bodyObjWithUnicode
  )}`;
  const payloadWithRegular = `${timestamp}${nonce}${method}${endpoint}${JSON.stringify(
    bodyObjWithRegular
  )}`;

  describe.each(makeSigningVariations())(
    '#️⃣  $index: $preEncoding ❯ $hashAlgorithm ❯ $signingAlgorithm ❯ $postEncoding',
    ({ signingAlgorithm, hashAlgorithm, preEncoding, postEncoding, privateKey }) => {
      let signatureUnicode: string;
      let signatureRegular: string;

      beforeAll(() => {
        config.set('authentication.signing', {
          signingAlgorithm,
          hashAlgorithm,
          preEncoding,
          postEncoding,
          privateKey,
        });
        signatureUnicode = buildRequestSignature(payloadWithUnicode);
        signatureRegular = buildRequestSignature(payloadWithRegular);
      });

      it('should verify the signature successfully with unicode payload', () => {
        expect(verifySignature(payloadWithUnicode, signatureUnicode)).toBe(true);
      });

      it('should verify the signature successfully with regular payload', () => {
        expect(verifySignature(payloadWithRegular, signatureRegular)).toBe(true);
      });

      it('should fail when verifying unicode payload with regular signature', () => {
        expect(verifySignature(payloadWithUnicode, signatureRegular)).toBe(false);
      });

      it('should fail when verifying regular payload with unicode signature', () => {
        expect(verifySignature(payloadWithRegular, signatureUnicode)).toBe(false);
      });
    }
  );
});
