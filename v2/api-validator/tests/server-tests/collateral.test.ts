import Client from '../../src/client';
import { getCapableAccountId, hasCapability } from '../utils/capable-accounts';
import { Pageable, paginated } from '../utils/pagination';
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
  CollateralAssetAddress,
  PublicBlockchainCapability
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
    collateralId = `${randomUUID()}.${accountId}.${randomUUID()}`;
    collateralSinersList = [randomUUID(), randomUUID(), randomUUID()];
    requestBody = {
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

      for await (const collateralAccountLinks of paginated(getCollateralAccountLinks)) {
        expect(Object.values(CollateralLinkStatus)).toContain(collateralAccountLinks.status);
        if (
          collateralAccountLinks.status === CollateralLinkStatus.DISABLED ||
          collateralAccountLinks.status == CollateralLinkStatus.FAILED
        ) {
          expect(typeof collateralAccountLinks.rejectionReason).toBe('string');
        }
        expect(Object.values(Environment)).toContain(collateralAccountLinks.env);
        expect(collateralAccountLinks.collateralId).toBe(collateralId);
        expect(collateralAccountLinks.collateralSigners).toEqual(collateralSinersList);
        expect(Object.values(Blockchain)).toContain(
          collateralAccountLinks.eligibleCollateralAssets[0]['blockchain']
        );
        expect(Object.values(CryptocurrencySymbol)).toContain(
          collateralAccountLinks.eligibleCollateralAssets[0]['cryptocurrencySymbol']
        );
        if (collateralAccountLinks.env === Environment.PROD)
          expect(collateralAccountLinks.eligibleCollateralAssets[0]['testAsset']).toEqual(false);
        else if (collateralAccountLinks.env === Environment.SANDBOX)
          expect(collateralAccountLinks.eligibleCollateralAssets[0]['testAsset']).toEqual(true);
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
  
  describe('get collateral deposit addresses', () => {
    const GetCollateralDepositAddressesFailureResult = async (
      failType: number,
      limit?,
      startingAfter?
    ): Promise<ApiError> => {
      let accId = accountId;
      let lim = limit;
      lim = 10;
      if (failType == 404) {
        accId = '1';
      } else {
        lim = 'aa';
      }
      try {
        await client.collateral.getCollateralDepositAddresses({
          accountId: accId,
          collateralId,
          limit: lim,
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

    it('collateral deposit address should return with a valid schema', async () => {
      const getCollateralDepositAddresses: Pageable<CollateralAssetAddress> = async (
        limit,
        startingAfter?
      ) => {
        limit = 10;
        const response = await client.collateral.getCollateralDepositAddresses({
          accountId,
          collateralId,
          limit,
          startingAfter,
        });
        return response.addresses;
      };
      for await (const collateralAccountAddress of paginated(getCollateralDepositAddresses)) {
        const addressObj = collateralAccountAddress.address;
        const assetObj = collateralAccountAddress.asset

        expect(typeof collateralAccountAddress.fireblocksAssetId).toBe('string');
        expect(typeof collateralAccountAddress.recoveryAccountId).toBe('string');
        expect(typeof addressObj.transferMethod).toBe('string');
        expect(Object.values(PublicBlockchainCapability.transferMethod)).toContain(
          addressObj.transferMethod
        );
        if (!!addressObj.addressTag)
          expect(typeof addressObj.addressTag).toBe('string');
        expect(Object.values(Blockchain)).toContain(
          addressObj.asset['blockchain']
        );
        expect(Object.values(CryptocurrencySymbol)).toContain(
          addressObj.asset['cryptocurrencySymbol']
        );
        expect(typeof addressObj.asset['testAsset']).toBe('boolean');
        expect(Object.values(Blockchain)).toContain(
          assetObj['blockchain']
        );
        expect(Object.values(CryptocurrencySymbol)).toContain(
          assetObj['cryptocurrencySymbol']
        );
        expect(typeof assetObj['testAsset']).toBe('boolean');
      }
    });

    it('request should fail with Not Found', async () => {
      const error = await GetCollateralDepositAddressesFailureResult(404);

      expect(error.status).toBe(404);
      expect(error.body.errorType).toBe(GeneralError.errorType.NOT_FOUND);
      expect(error.body.requestPart).toBe(undefined);
    });

    it('request should fail schema property', async () => {
      const error = await GetCollateralDepositAddressesFailureResult(400);

      expect(error.status).toBe(400);
      expect(error.body.errorType).toBe(BadRequestError.errorType.SCHEMA_PROPERTY_ERROR);
      expect(error.body.requestPart).toBe(RequestPart.QUERYSTRING);
    });
  });
});
