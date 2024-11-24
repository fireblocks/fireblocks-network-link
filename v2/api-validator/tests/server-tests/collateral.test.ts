import { CollateralAccount } from '../../src/client/generated';
import Client from '../../src/client';
import { getCapableAccountId, hasCapability } from '../utils/capable-accounts';
import {
  ApiError,
  BadRequestError,
  CollateralLinkStatus,
  RequestPart,
  Environment,
  Blockchain,
  CryptocurrencySymbol,
} from '../../src/client/generated';
import { randomUUID } from 'crypto';

const noCollateralapability = !hasCapability('collateral');

describe.skipIf(noCollateralapability)('collateral', () => {
  let client: Client;
  let accountId: string;
  let collateralId: string;
  let collateralSinersList: string[];
  let requestBody: CollateralAccount;

  beforeAll(async () => {
    client = new Client();
    accountId = getCapableAccountId('collateral');
    collateralId = `${accountId}.${randomUUID()}`;
    collateralSinersList = [randomUUID(), randomUUID(), randomUUID()];
    requestBody = {
      collateralId: collateralId,
      collateralSigners: collateralSinersList,
      env: Environment.PROD,
    };
  });

  describe('get collateral accounts linked', () => {
    let collateralAccount: CollateralAccount;

    const GetCreateCollateralAccountLinksFailureResult = async (
      requestBody: CollateralAccount
    ): Promise<ApiError> => {
      try {
        await client.collateral.createCollateralAccountLink({ accountId, requestBody });
      } catch (err) {
        if (err instanceof ApiError) {
          return err;
        }
        throw err;
      }
      throw new Error('Expected to throw');
    };

    it('collateral account should return with a valid schema', async () => {
      const createCollateralLink = await client.collateral.createCollateralAccountLink({
        accountId,
        requestBody,
      });
      expect(Object.values(CollateralLinkStatus)).toContain(createCollateralLink.status);
      if (
        createCollateralLink.status === CollateralLinkStatus.DISABLED ||
        createCollateralLink.status == CollateralLinkStatus.FAILED
      ) {
        expect(typeof createCollateralLink.rejectionReason).toBe('string');
      }
      expect(Object.values(Environment)).toContain(createCollateralLink.env);
      expect(createCollateralLink.collateralId).toBe(collateralId);
      expect(createCollateralLink.collateralSigners).toEqual(collateralSinersList);
      expect(Object.values(Blockchain)).toContain(
        createCollateralLink.eligibleCollateralAssets[0]['blockchain']
      );
      expect(Object.values(CryptocurrencySymbol)).toContain(
        createCollateralLink.eligibleCollateralAssets[0]['cryptocurrencySymbol']
      );
      if (createCollateralLink.env === Environment.PROD)
        expect(createCollateralLink.eligibleCollateralAssets[0]['testAsset']).toEqual(false);
      else if (createCollateralLink.env === Environment.SANDBOX)
        expect(createCollateralLink.eligibleCollateralAssets[0]['testAsset']).toEqual(true);
    });

    it('request should fail schema property', async () => {
      const error = await GetCreateCollateralAccountLinksFailureResult({
        ...collateralAccount,
      });

      expect(error.status).toBe(400);
      expect(error.body.errorType).toBe(BadRequestError.errorType.SCHEMA_PROPERTY_ERROR);
      expect(error.body.requestPart).toBe(RequestPart.BODY);
    });
  });
});
