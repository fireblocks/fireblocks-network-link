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

describe('collateral', () => {
  let client: Client;
  let accountId: string;
  let collateralId: string;
  let collateralSignersList: string[];
  let requestBody: CollateralAccount;
  let createCollateralAccountLinkResponse: CollateralAccountLink;

  beforeAll(async () => {
    client = new Client();
    accountId = getCapableAccountId('collateral');
    collateralId = `${uuid()}.${accountId}.${uuid()}`;
    collateralSignersList = config.get('collateral.accountLink.signers');
  });

  describe('Collateral Account Link', () => {
    describe('POST request: createCollateralAccountLink', () => {
      describe('Should be sucess tests and a valid response', () => {
        it('with PROD env param, should return env: Prod and testAsset: false', async () => {
          requestBody = {
            collateralId: collateralId,
            collateralSigners: collateralSignersList,
            env: Environment.PROD,
          };

          createCollateralAccountLinkResponse = await client.collateral.createCollateralAccountLink(
            {
              accountId,
              requestBody,
            }
          );

          expect(createCollateralAccountLinkResponse.collateralId).toBe(collateralId);

          expect(createCollateralAccountLinkResponse.collateralSigners).toEqual(
            collateralSignersList
          );

          expect(createCollateralAccountLinkResponse.env).toBe(Environment.PROD);

          expect(createCollateralAccountLinkResponse.status).toBe(CollateralLinkStatus.ELIGIBLE);

          expect(createCollateralAccountLinkResponse.rejectionReason).toBeUndefined();

          const assetObject = createCollateralAccountLinkResponse.eligibleCollateralAssets;

          if (assetObject['testAsset'] !== undefined)
            expect(assetObject['testAsset']).toEqual(false);
        });

        it('Happy flow with SANDBOX env param, should return env: Sandbox and testAsset: true', async () => {
          requestBody = {
            collateralId: collateralId,
            collateralSigners: collateralSignersList,
            env: Environment.SANDBOX,
          };

          createCollateralAccountLinkResponse = await client.collateral.createCollateralAccountLink(
            {
              accountId,
              requestBody,
            }
          );

          expect(createCollateralAccountLinkResponse.collateralId).toBe(collateralId);

          expect(createCollateralAccountLinkResponse.collateralSigners).toEqual(
            collateralSignersList
          );

          expect(createCollateralAccountLinkResponse.env).toBe(Environment.SANDBOX);

          expect(createCollateralAccountLinkResponse.status).toBe(CollateralLinkStatus.ELIGIBLE);

          expect(createCollateralAccountLinkResponse.rejectionReason).toBeUndefined();

          const assetObject = createCollateralAccountLinkResponse.eligibleCollateralAssets;

          if (assetObject['testAsset'] !== undefined)
            expect(assetObject['testAsset']).toEqual(true);
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
});
