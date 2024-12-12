import {
  CollateralAccount,
  CollateralAccountLink,
  CollateralAsset,
  CollateralLinkStatus,
  CollateralSignerId,
  Environment,
} from '../../../../src/client/generated';
import { getCapableAccountId } from '../../../utils/capable-accounts';
import { v4 as uuid } from 'uuid';
import { Pageable, paginated } from '../../../utils/pagination';
import config from '../../../../src/config';
import Client from '../../../../src/client';

describe('Account Link', () => {
  const client = new Client();

  describe('createCollateralAccountLink', () => {
    describe.each([
      { env: Environment.PROD, expectedTestAsset: false },
      { env: Environment.SANDBOX, expectedTestAsset: true },
    ])('Successful request', (testParams) => {
      const { env, expectedTestAsset } = testParams;
      it('should return valid response', async () => {
        const accountId = getCapableAccountId('collateral');
        const collateralId = `${uuid()}.${accountId}.${uuid()}`;
        const collateralSigners: CollateralSignerId[] = config.get(
          'collateral.accountLink.signers'
        );
        const response = await client.collateral.createCollateralAccountLink({
          accountId,
          requestBody: {
            collateralId,
            collateralSigners,
            env: env,
          },
        });

        expect(response.collateralId).toBe(collateralId);
        expect(response.collateralSigners).toEqual(collateralSigners);
        expect(response.rejectionReason).toBeUndefined();
        expect(response.status).toBe(CollateralLinkStatus.ELIGIBLE);

        const assetsList: CollateralAsset[] = response.eligibleCollateralAssets;
        for (const asset of assetsList) {
          if (typeof asset['testAsset'] === 'boolean') {
            expect(asset['testAsset']).toBe(expectedTestAsset);
          }
        }
      });
    });

    it('for unknown collateral signers or collateralId for the provider, should return with failed status and rejectionReason', async () => {
      const accountId = getCapableAccountId('collateral');
      const collateralId = '10';
      const collateralSigners: CollateralSignerId[] = ['10'];
      const requestBody: CollateralAccount = {
        collateralId,
        collateralSigners,
        env: Environment.PROD,
      };
      const response = await client.collateral.createCollateralAccountLink({
        accountId,
        requestBody,
      });

      expect(response.status).toBe(CollateralLinkStatus.FAILED);
      expect(response).toHaveProperty('rejectionReason');
    });
  });

  describe('getCollateralAccountLinks', () => {
    it('simple valid response - one page', async () => {
      const accountId = getCapableAccountId('collateral');
      const singlePageResponse = await client.collateral.getCollateralAccountLinks({
        accountId,
      });

      for await (const collateralAccountLink of singlePageResponse.collateralLinks) {
        if (
          collateralAccountLink.status === CollateralLinkStatus.FAILED ||
          collateralAccountLink.status === CollateralLinkStatus.DISABLED
        ) {
          expect(collateralAccountLink).toHaveProperty('rejectionReason');
        }

        const assetsList: CollateralAsset[] = collateralAccountLink.eligibleCollateralAssets;
        const expectedTestAsset: boolean =
          collateralAccountLink.env === Environment.SANDBOX ? true : false;
        for (const asset of assetsList) {
          if (typeof asset['testAsset'] === 'boolean') {
            expect(asset['testAsset']).toBe(expectedTestAsset);
          }
        }
      }
    });

    it('multi page valid response', async () => {
      const accountId = getCapableAccountId('collateral');
      const getCollateralAccountLinks: Pageable<CollateralAccountLink> = async (
        limit,
        startingAfter?
      ) => {
        const response = await client.collateral.getCollateralAccountLinks({
          accountId,
          limit,
          startingAfter,
        });

        return response.collateralLinks;
      };

      for await (const collateralAccountLink of paginated(getCollateralAccountLinks)) {
        if (
          collateralAccountLink.status === CollateralLinkStatus.FAILED ||
          collateralAccountLink.status === CollateralLinkStatus.DISABLED
        ) {
          expect(collateralAccountLink).toHaveProperty('rejectionReason');
        }

        const assetsList: CollateralAsset[] = collateralAccountLink.eligibleCollateralAssets;
        const expectedTestAsset: boolean =
          collateralAccountLink.env === Environment.SANDBOX ? true : false;
        for (const asset of assetsList) {
          if (typeof asset['testAsset'] === 'boolean') {
            expect(asset['testAsset']).toBe(expectedTestAsset);
          }
        }
      }
    });
  });
});
