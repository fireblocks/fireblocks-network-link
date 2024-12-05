
import Client from '../../../src/client';
import config from '../../../src/config';
import { getCapableAccountId, hasCapability } from '../../utils/capable-accounts';
import { Pageable, paginated } from '../../utils/pagination';
import {
  CollateralLinkStatus,
  Environment,
  Blockchain,
  CryptocurrencySymbol,
  CollateralAccount,
  CollateralAccountLink,
} from '../../../src/client/generated';
import { AxiosHttpRequest } from '../../../src/client/generated/core/AxiosHttpRequest';
import { randomUUID } from 'crypto';
import { fakeSchemaObject } from '../../../src/schemas';

jest.mock('../../../src/client/generated/core/AxiosHttpRequest');
const mockRequest = AxiosHttpRequest as jest.MockedClass<typeof AxiosHttpRequest>
// jest.mock('axios');
// const mockedAxios = axios as jest.MockedObject<typeof axios>;

const noCollateralapability = !hasCapability('collateral');

describe.skipIf(noCollateralapability)('collateral', () => {
  let client: Client;
  let accountId: string;
  let collateralId: string;
  let collateralSignersList: string[];
  let requestBody: CollateralAccount;
  let createCollateralAccountLinkResponse: CollateralAccountLink;

  beforeAll(async () => {
    client = new Client();
    accountId = getCapableAccountId('collateral');
    collateralId = `${randomUUID()}.${accountId}.${randomUUID()}`;
    collateralSignersList = config.get('collateral.accountLink.signers');
    requestBody = {
      id: randomUUID(),
      collateralId: collateralId,
      collateralSigners: collateralSignersList,
      env: Environment.PROD,
    };

    const response  = {
      "collateralLinks": [
        {
          "collateralId": "f861c6ca-f4c8-44dd-a02e-081a38745623.95e40c1e-407e-405c-871e-d69218611a79.4cd3e66b-4ee4-4750-bcfd-d2d43054fc5d",
          "collateralSigners": [
            "4cd3e66b-4ee4-4750-bcfd-d2d43054fc5d"
          ],
          "id": "360de0ad-9ba1-45d5-8074-22453f193d65",
          "eligibleCollateralAssets": [
            {
              "blockchain": "Bitcoin",
              "cryptocurrencySymbol": "BTC",
              "testAsset": false
            },
            {
              "assetId": "360de0ad-9ba1-45d5-8074-22453f193d65"
            }
          ],
          "status": "Linked",
          "env": "kaka"
        }
      ]
    }

    mockRequest.prototype.request.mockResolvedValue({ status: 200, data: response });
    // mockedAxios.request.mockImplementation(() => Promise.resolve({ status: 200, data: response }));

  });

  describe('Collateral Account Link', () => {
    describe('POST request: createCollateralAccountLink', () => {
      describe('Should be sucess tests and a valid response', () => {
        beforeEach(async () => {
          createCollateralAccountLinkResponse = await client.collateral.createCollateralAccountLink(
            {
              accountId,
              requestBody,
            }
          );
        });

        it('Check all required parameters exist and their type', () => {
          expect(typeof createCollateralAccountLinkResponse.id).toBe('string');

          expect(typeof createCollateralAccountLinkResponse.collateralId).toBe('string');

          expect(createCollateralAccountLinkResponse.collateralSigners).toEqual(
            collateralSignersList
          );

          expect(createCollateralAccountLinkResponse.eligibleCollateralAssets).toBeArray();

          expect(Object.values(Environment)).toContain(createCollateralAccountLinkResponse.env);

          expect(Object.values(CollateralLinkStatus)).toContain(
            createCollateralAccountLinkResponse.status
          );
        });

        it('Validate collateralSigners properties type is string', () => {
          createCollateralAccountLinkResponse.collateralSigners.forEach((signer) =>
            expect(typeof signer).toBe('string')
          );
        });

        describe('eligibleCollateralAssets validation', () => {
          beforeEach(async () => {
            createCollateralAccountLinkResponse =
              await client.collateral.createCollateralAccountLink({
                accountId,
                requestBody,
              });
          });

          it('eligibleCollateralAssets should have assetId or NativeCryptocurrency object', () => {
            const assetObject = createCollateralAccountLinkResponse.eligibleCollateralAssets;
            // each collateralAsset can have assetId or NativeCryptocurrency object {blockchain?, cryptocurrencySymbol, testAsset?}
            if (assetObject['assetId']) {
              expect(assetObject['blockchain']).toBeUndefined;

              expect(assetObject['cryptocurrencySymbol']).toBeUndefined;
            }
          });

          it('Validate eligibleCollateralAssets required properties exist and their type', () => {
            const assetObject = createCollateralAccountLinkResponse.eligibleCollateralAssets;
            // each collateralAsset can have assetId or NativeCryptocurrency object {blockchain?, cryptocurrencySymbol, testAsset?}
            if (assetObject['assetId']) {
              if (assetObject['blockchain']) {
                expect(Object.values(Blockchain)).toContain(assetObject['blockchain']);
              }

              expect(Object.values(CryptocurrencySymbol)).toContain(
                assetObject['cryptocurrencySymbol']
              );

              if (assetObject['testAsset']) {
                if (createCollateralAccountLinkResponse.env === Environment.PROD) {
                  expect(assetObject['testAsset']).toEqual(false);
                } else if (createCollateralAccountLinkResponse.env === Environment.SANDBOX) {
                  expect(assetObject['testAsset']).toEqual(true);
                } else {
                  expect(assetObject['testAsset']).toBe('string');
                }
              } else {
                expect(typeof assetObject['assetId']).toBe('string');
              }
            }
          });
        });

        it('rejectionReason should exist only when status is Disabled or Failed, and his type is string', () => {
          if (createCollateralAccountLinkResponse.rejectionReason) {
            expect(createCollateralAccountLinkResponse.rejectionReason).toBe('string');

            expect(createCollateralAccountLinkResponse.status).not.toBe(
              CollateralLinkStatus.DISABLED
            );

            expect(createCollateralAccountLinkResponse.rejectionReason).not.toBe(
              CollateralLinkStatus.FAILED
            );
          }
        });
      });
    });

    describe('GET request: getCollateralAccountLinks', () => {
      describe('Should Sucess Tests', () => {
        const getCollateralAccountLinks: Pageable<CollateralAccountLink> = async (
          limit,
          startingAfter?
        ) => {
          const response = await client.collateral.getCollateralAccountLinks({
            accountId: accountId,
            limit: limit,
            startingAfter: startingAfter,
          });
          return response.collateralLinks;
        };

        it.only('Check all required parameters exist and their type', async () => {
          //const data = fakeSchemaObject('CollateralAccountLink') as CollateralAccountLink

          
          for await (const collateralAccountLink of paginated(getCollateralAccountLinks)) {
            expect(typeof collateralAccountLink.id).toBe('string');

            expect(typeof collateralAccountLink.collateralId).toBe('string');

            expect(collateralAccountLink.collateralSigners).toEqual(collateralSignersList);

            expect(collateralAccountLink.eligibleCollateralAssets).toBeArray();

            expect(Object.values(Environment)).toContain(collateralAccountLink.env);

            expect(Object.values(CollateralLinkStatus)).toContain(collateralAccountLink.status);
          }
        });

        it('Validate collateralSigners properties type is string', async () => {
          for await (const collateralAccountLink of paginated(getCollateralAccountLinks)) {
            collateralAccountLink.collateralSigners.forEach((signer) =>
              expect(typeof signer).toBe('string')
            );
          }
        });

        it('Validate eligibleCollateralAssets properties required parameters exist and their type', async () => {
          for await (const collateralAccountLink of paginated(getCollateralAccountLinks)) {
            for (const assetObject of collateralAccountLink.eligibleCollateralAssets) {
              // each collateralAsset can have assetId or NativeCryptocurrency object {blockchain?, cryptocurrencySymbol, testAsset?}
              if (assetObject['assetId'] === undefined) {
                if (assetObject['blockchain']) {
                  expect(Object.values(Blockchain)).toContain(assetObject['blockchain']);
                }

                expect(Object.values(CryptocurrencySymbol)).toContain(
                  assetObject['cryptocurrencySymbol']
                );

                if (assetObject['testAsset']) {
                  if (collateralAccountLink.env === Environment.PROD) {
                    expect(assetObject['testAsset']).toEqual(false);
                  } else if (collateralAccountLink.env === Environment.SANDBOX) {
                    expect(assetObject['testAsset']).toEqual(true);
                  } else {
                    expect(assetObject['testAsset']).toBe('string');
                  }
                } else {
                  expect(typeof assetObject['assetId']).toBe('string');
                }
              }
            }
          }
        });

        it('rejectionReason should exist only when status is Disabled or Failed, and his type is string', async () => {
          for await (const collateralAccountLink of paginated(getCollateralAccountLinks)) {
            if (collateralAccountLink.rejectionReason) {
              expect(collateralAccountLink.rejectionReason).toBe('string');

              expect(collateralAccountLink.status).not.toBe(CollateralLinkStatus.DISABLED);

              expect(collateralAccountLink.rejectionReason).not.toBe(CollateralLinkStatus.FAILED);
            }
          }
        });
      });
    });
  });
});
