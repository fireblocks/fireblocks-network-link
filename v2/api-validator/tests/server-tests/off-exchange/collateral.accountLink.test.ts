import Client from '../../../src/client';
import { getCapableAccountId, hasCapability } from '../../utils/capable-accounts';
import { Pageable, paginated } from '../../utils/pagination';
import {
  ApiError,
  BadRequestError,
  CollateralLinkStatus,
  RequestPart,
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
  let collateralSinersList: string[];
  let requestBody: CollateralAccount;

  beforeAll(async () => {
    client = new Client();
    accountId = getCapableAccountId('collateral');
    collateralId = `${randomUUID()}.${accountId}.${randomUUID()}`;
    collateralSinersList = [randomUUID(), randomUUID(), randomUUID()];
    requestBody = {
      id: randomUUID(),
      collateralId: collateralId,
      collateralSigners: collateralSinersList,
      env: Environment.PROD,
    };
  });

  describe('create collateral accounts links', () => {
    let collateralAccount: CollateralAccount;

    const CreateCollateralAccountLinksFailureResult = async (
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

    it('request should fail with Not Found', async () => {
      requestBody.collateralId = '1';

      const error = await CreateCollateralAccountLinksFailureResult(requestBody);

      expect(error.status).toBe(404);
      expect(error.body.errorType).toBe(GeneralError.errorType.NOT_FOUND);
      expect(error.body.requestPart).toBe(undefined);
    });

    it('request should fail schema property', async () => {
      const error = await CreateCollateralAccountLinksFailureResult({
        ...collateralAccount,
      });

      expect(error.status).toBe(400);
      expect(error.body.errorType).toBe(BadRequestError.errorType.SCHEMA_PROPERTY_ERROR);
      expect(error.body.requestPart).toBe(RequestPart.BODY);
    });
  });

  describe('get linked collateral accounts', () => {
    const GetCollateralAccountLinksFailureResult = async (
      failType: number,
      limit?,
      startingAfter?
    ): Promise<ApiError> => {
      let accId = accountId;
      if (failType == 404) {
        accId = '1';
      } else {
        limit = 'aa';
      }
      try {
        await client.collateral.getCollateralAccountLinks({
          accountId: accId,
          limit: limit,
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
      const error = await GetCollateralAccountLinksFailureResult(404);

      expect(error.status).toBe(404);
      expect(error.body.errorType).toBe(GeneralError.errorType.NOT_FOUND);
      expect(error.body.requestPart).toBe(undefined);
    });

    it('request should fail schema property', async () => {
      const error = await GetCollateralAccountLinksFailureResult(400);

      expect(error.status).toBe(400);
      expect(error.body.errorType).toBe(BadRequestError.errorType.SCHEMA_PROPERTY_ERROR);
      expect(error.body.requestPart).toBe(RequestPart.QUERYSTRING);
    });
  });
});
