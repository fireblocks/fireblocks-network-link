import {
  CollateralAccount,
  CollateralAccountLink,
  CollateralLinkStatus,
  CollateralSignerId,
  AccountEnvironment,
} from '../../../src/client/generated';
import { getCapableAccountId, hasCapability } from '../../utils/capable-accounts';
import { Pageable, paginated } from '../../utils/pagination';
import config from '../../../src/config';
import Client from '../../../src/client';

const noCollateralCapability = !hasCapability('transfers');

describe.skipIf(noCollateralCapability)('Account Link', () => {
  const client = new Client();

  describe('Creates a new link between a collateral account and a provider account', () => {
    describe('Successful request', () => {
      it('Should return valid response', async () => {
        const accountId: string = getCapableAccountId('collateral');
        const collateralId: string = config.get('collateral.collateralAccount.accountId');
        const collateralSigners: CollateralSignerId[] = config.get('collateral.signers.userId');
        const response: CollateralAccountLink = await client.collateral.createCollateralAccountLink(
          {
            accountId,
            requestBody: {
              collateralId,
              collateralSigners,
              env: AccountEnvironment.PROD,
            },
          }
        );

        expect(response.collateralId).toBe(collateralId);
        expect(response.collateralSigners).toEqual(collateralSigners);
        expect(response.rejectionReason).toBeUndefined();
        expect(response.status).toBe(CollateralLinkStatus.ELIGIBLE);
        expect(response.env).toBe(AccountEnvironment.PROD);
      });
    });

    it('For unknown collateral signers or collateralId for the provider, should return with failed status and rejectionReason', async () => {
      const accountId: string = getCapableAccountId('collateral');
      const collateralId = 'unknownId';
      const collateralSigners: CollateralSignerId[] = ['unknownId'];
      const requestBody: CollateralAccount = {
        collateralId,
        collateralSigners,
        env: AccountEnvironment.PROD,
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
    it('Simple valid response - one page', async () => {
      const accountId: string = getCapableAccountId('collateral');
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
      }
    });

    it('Multi page valid response', async () => {
      const accountId: string = getCapableAccountId('collateral');
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
      }
    });
  });
});
