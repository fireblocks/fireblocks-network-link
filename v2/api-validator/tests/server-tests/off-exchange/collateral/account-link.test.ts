import {
  CollateralAccount,
  CollateralAccountLink,
  CollateralLinkStatus,
  CollateralSignerId,
  CryptocurrencyReference,
  Environment,
} from '../../../../src/client/generated';
import { getCapableAccountId } from '../../../utils/capable-accounts';
import { Pageable, paginated } from '../../../utils/pagination';
import config from '../../../../src/config';
import Client from '../../../../src/client';

describe('Account Link', () => {
  const client = new Client();

  describe('Creates a new link between a collateral account and a provider account', () => {
    describe.each([
      { env: Environment.PROD, expectedTestAsset: false },
      { env: Environment.SANDBOX, expectedTestAsset: true },
    ])('Successful request', (testParams) => {
      const { env, expectedTestAsset } = testParams;
      it('Should return valid response', async () => {
        const accountId = getCapableAccountId('collateral');
        const collateralId = config.get('collateral.collateralAccount.accountId');
        const collateralSigners: CollateralSignerId[] = config.get('collateral.signers.userId');
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
        expect(response.env).toBe(env);

        const assetsList: CryptocurrencyReference[] = response.eligibleCollateralAssets;
        for (const asset of assetsList) {
          if (typeof asset['testAsset'] === 'boolean') {
            expect(asset['testAsset']).toBe(expectedTestAsset);
          }
        }
      });
    });

    it('For unknown collateral signers or collateralId for the provider, should return with failed status and rejectionReason', async () => {
      const accountId = getCapableAccountId('collateral');
      const collateralId = 'unknownId';
      const collateralSigners: CollateralSignerId[] = ['unknownId'];
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

  describe('Get list of collateral account links', () => {
    async function checkCollateralAccountLink(collateralAccountLink: CollateralAccountLink) {
      if (
        collateralAccountLink.status === CollateralLinkStatus.FAILED ||
        collateralAccountLink.status === CollateralLinkStatus.DISABLED
      ) {
        expect(collateralAccountLink).toHaveProperty('rejectionReason');
      }

      const assetsList: CryptocurrencyReference[] = collateralAccountLink.eligibleCollateralAssets;
      const expectedTestAsset: boolean =
        collateralAccountLink.env === Environment.SANDBOX ? true : false;

      for (const asset of assetsList) {
        if (typeof asset['testAsset'] === 'boolean') {
          expect(asset['testAsset']).toBe(expectedTestAsset);
        }
      }
    }
    it('Simple valid response - one page', async () => {
      const accountId = getCapableAccountId('collateral');
      const singlePageResponse = await client.collateral.getCollateralAccountLinks({
        accountId,
      });

      for await (const collateralAccountLink of singlePageResponse.collateralLinks) {
        await checkCollateralAccountLink(collateralAccountLink);
      }
    });

    it('Multi page valid response', async () => {
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
        await checkCollateralAccountLink(collateralAccountLink);
      }
    });
  });
});
