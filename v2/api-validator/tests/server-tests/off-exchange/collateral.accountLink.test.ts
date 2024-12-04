import Client from '../../../src/client';
import config from '../../../src/config';
import { getCapableAccountId, hasCapability } from '../../utils/capable-accounts';
import { Pageable, paginated } from '../../utils/pagination';
import {
  ApiError,
  CollateralLinkStatus,
  Environment,
  Blockchain,
  CryptocurrencySymbol,
  CollateralAccount,
  CollateralAccountLink,
  GeneralError,
} from '../../../src/client/generated';
import { randomUUID } from 'crypto';

const noCollateralapability = !hasCapability('collateral');

describe.skipIf(noCollateralapability)('collateral', () => {
  let client: Client;
  let accountId: string;
  let collateralId: string;
  let collateralSignersList: string[];
  let requestBody: CollateralAccount;

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
  });

  describe('create collateral accounts links', () => {
    let collateralAccount: CollateralAccount;

    const createCollateralAccountLinksFailureResult = async (
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
      expect(typeof createCollateralLink.id).toBe('string');
      expect(Object.values(CollateralLinkStatus)).toContain(createCollateralLink.status);
      if (
        createCollateralLink.status === CollateralLinkStatus.DISABLED ||
        createCollateralLink.status == CollateralLinkStatus.FAILED
      ) {
        expect(typeof createCollateralLink.rejectionReason).toBe('string');
      }
      expect(Object.values(Environment)).toContain(createCollateralLink.env);
      expect(typeof createCollateralLink.collateralId).toBe('string');
      expect(createCollateralLink.collateralSigners).toBeArray();
      for (const signer of createCollateralLink.collateralSigners) {
        expect(typeof signer).toBe('string');
      }
      for (const asset of createCollateralLink.eligibleCollateralAssets) {
        if (asset['assetId'] === undefined) {
          expect(Object.values(Blockchain)).toContain(asset['blockchain']);
          expect(Object.values(CryptocurrencySymbol)).toContain(asset['cryptocurrencySymbol']);
          expect(typeof asset['testAsset']).toBe('boolean');
        } else {
          expect(typeof asset['assetId']).toBe('string');
        }
        if (createCollateralLink.env === Environment.PROD)
          expect(asset['testAsset']).toEqual(false);
        else if (createCollateralLink.env === Environment.SANDBOX)
          expect(asset['testAsset']).toEqual(true);
      }
    });
  });

  describe('get linked collateral accounts', () => {
    const getCollateralAccountLinksFailureResult = async (
      accountId: string,
      limit?,
      startingAfter?
    ): Promise<ApiError> => {
      try {
        await client.collateral.getCollateralAccountLinks({
          accountId,
          limit,
          startingAfter: startingAfter,
        });
      } catch (err) {
        if (err instanceof ApiError) {
          return err;
        }
        throw err;
      }
      throw new Error('Expected to throw');
    };

    it('collateral account should return with a valid schema', async () => {
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

      for await (const collateralAccountLink of paginated(getCollateralAccountLinks)) {
        expect(typeof collateralAccountLink.id).toBe('string');
        expect(Object.values(CollateralLinkStatus)).toContain(collateralAccountLink.status);
        if (
          collateralAccountLink.status === CollateralLinkStatus.DISABLED ||
          collateralAccountLink.status == CollateralLinkStatus.FAILED
        ) {
          expect(typeof collateralAccountLink.rejectionReason).toBe('string');
        }
        expect(Object.values(Environment)).toContain(collateralAccountLink.env);
        expect(typeof collateralAccountLink.collateralId).toBe('string');
        expect(collateralAccountLink.collateralSigners).toBeArray();
        for (const signer of collateralAccountLink.collateralSigners) {
          expect(typeof signer).toBe('string');
        }
        for (const asset of collateralAccountLink.eligibleCollateralAssets) {
          if (asset['assetId'] === undefined) {
            expect(Object.values(Blockchain)).toContain(asset['blockchain']);
            expect(Object.values(CryptocurrencySymbol)).toContain(asset['cryptocurrencySymbol']);
            expect(typeof asset['testAsset']).toBe('boolean');
          } else {
            expect(typeof asset['assetId']).toBe('string');
          }
          if (collateralAccountLink.env === Environment.PROD)
            expect(asset['testAsset']).toEqual(false);
          else if (collateralAccountLink.env === Environment.SANDBOX)
            expect(asset['testAsset']).toEqual(true);
        }
      }
    });

    it('request should fail with Not Found', async () => {
      const error = await getCollateralAccountLinksFailureResult('1');

      expect(error.status).toBe(404);
      expect(error.body.errorType).toBe(GeneralError.errorType.NOT_FOUND);
      expect(error.body.requestPart).toBe(undefined);
    });
  });
});
