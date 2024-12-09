import Client from '../../../../src/client';
import config from '../../../../src/config';
import { getCapableAccountId } from '../../../utils/capable-accounts';
import { Pageable, paginated } from '../../../utils/pagination';
import {
  CollateralLinkStatus,
  Environment,
  CollateralAccount,
  CollateralAccountLink,
} from '../../../../src/client/generated';
import { v4 as uuid } from 'uuid';

describe('Collateral Account Link', () => {
  let client: Client;
  let accountId: string;
  let collateralId: string;
  let collateralSignersList: string[];
  let createCollateralAccountLinkResponse: CollateralAccountLink;

  beforeAll(() => {
    client = new Client();
    accountId = getCapableAccountId('collateral');
    collateralId = `${uuid()}.${accountId}.${uuid()}`;
    collateralSignersList = config.get('collateral.accountLink.signers');
  });

  describe('POST request: createCollateralAccountLink', () => {
    describe('Should be a sucess link tests and a valid response', () => {
      const testParams = [
        { env: Environment.SANDBOX, expectedEnv: Environment.SANDBOX, expectedTestAsset: true },
        { env: Environment.PROD, expectedEnv: Environment.PROD, expectedTestAsset: false },
      ];

      it('Should retunrn same collateralId, collateralSigners, status: eligble and rejectionReason: undefined', async () => {
        createCollateralAccountLinkResponse = await client.collateral.createCollateralAccountLink({
          accountId,
          requestBody: {
            collateralId: collateralId,
            collateralSigners: collateralSignersList,
            env: Environment.PROD,
          },
        });

        expect(createCollateralAccountLinkResponse.collateralId).toBe(collateralId);

        expect(createCollateralAccountLinkResponse.collateralSigners).toEqual(
          collateralSignersList
        );

        expect(createCollateralAccountLinkResponse.rejectionReason).toBeUndefined();

        expect(createCollateralAccountLinkResponse.status).toBe(CollateralLinkStatus.ELIGIBLE);
      });

      it.each(testParams)(
        'Happy flow with $env env param, should return env: $expectedEnv and testAsset: $expectedTestAsset',
        async ({ env, expectedEnv, expectedTestAsset }) => {
          createCollateralAccountLinkResponse = await client.collateral.createCollateralAccountLink(
            {
              accountId,
              requestBody: {
                collateralId: collateralId,
                collateralSigners: collateralSignersList,
                env: env,
              },
            }
          );

          expect(createCollateralAccountLinkResponse.env).toBe(expectedEnv);

          const assetObject = createCollateralAccountLinkResponse.eligibleCollateralAssets;
          if (assetObject['testAsset'] !== undefined) {
            expect(assetObject['testAsset']).toEqual(expectedTestAsset);
          }
        }
      );
    });

    describe('Should fail link tests and a valid response', () => {
      const testParams = [
        {
          collateralId: '10',
          collateralSigners: config.get('collateral.accountLink.signers'),
          expectedStatus: CollateralLinkStatus.FAILED,
          expectedRejectionReason: true,
        },
        {
          collateralId: `${uuid()}.${accountId}.${uuid()}`,
          collateralSigners: ['10'],
          expectedStatus: CollateralLinkStatus.FAILED,
          expectedRejectionReason: true,
        },
      ];

      it.each(testParams)(
        'with %p, should return failed status and rejectionReason',
        async ({ collateralId, collateralSigners, expectedStatus, expectedRejectionReason }) => {
          createCollateralAccountLinkResponse = await client.collateral.createCollateralAccountLink(
            {
              accountId,
              requestBody: {
                collateralId,
                collateralSigners,
                env: Environment.PROD,
              },
            }
          );

          expect(createCollateralAccountLinkResponse.status).toBe(expectedStatus);

          if (expectedRejectionReason) {
            expect(createCollateralAccountLinkResponse).toHaveProperty('rejectionReason');
          }
        }
      );
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

      it('Check all required parameters exist and their type', async () => {
        for await (const collateralAccountLink of paginated(getCollateralAccountLinks)) {
          if (collateralAccountLink.rejectionReason) {
            expect(collateralAccountLink.status).not.toBe(CollateralLinkStatus.LINKED);

            expect(collateralAccountLink.rejectionReason).not.toBe(CollateralLinkStatus.ELIGIBLE);

            expect(collateralAccountLink.rejectionReason).not.toBe(CollateralLinkStatus.FAILED);
          }

          const assetObject = collateralAccountLink.eligibleCollateralAssets;

          if (assetObject['testAsset'] !== undefined) {
            if (collateralAccountLink.env === Environment.PROD) {
              expect(assetObject['testAsset']).toEqual(false);
            } else if (collateralAccountLink.env === Environment.SANDBOX) {
              expect(assetObject['testAsset']).toEqual(true);
            }
          }
        }
      });
    });
  });
});
