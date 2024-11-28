import Client from '../../../src/client';
import { getCapableAccountId, hasCapability } from '../../utils/capable-accounts';
import { Pageable, paginated } from '../../utils/pagination';
import {
  ApiError,
  BadRequestError,
  RequestPart,
  Blockchain,
  CryptocurrencySymbol,
  GeneralError,
  CollateralAssetAddress,
  PublicBlockchainCapability,
  CollateralAddress,
} from '../../../src/client/generated';
import { randomUUID } from 'crypto';

const noCollateralapability = !hasCapability('collateral');

describe.skipIf(noCollateralapability)('collateral', () => {
  let client: Client;
  let accountId: string;
  let collateralId: string;
  let fireblocksAssetId: string;

  beforeAll(async () => {
    client = new Client();
    accountId = getCapableAccountId('collateral');
    fireblocksAssetId = randomUUID();
    collateralId = `${randomUUID()}.${accountId}.${randomUUID()}`;
  });

  describe('create collateral deposit address for asset', () => {
    const address = {
      id: randomUUID(),
      address: {
        asset: {
          blockchain: Blockchain.BITCOIN,
          cryptocurrencySymbol: CryptocurrencySymbol.BTC,
          testAsset: false,
        },
        transferMethod: PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN,
        address: randomUUID(),
        addressTag: randomUUID(),
      },
      recoveryAccountId: randomUUID(),
    };
    const CreateCollateralAccountLinksFailureResult = async (
      acc: string,
      requestBody: CollateralAddress
    ): Promise<ApiError> => {
      try {
        await client.collateral.createCollateralDepositAddressForAsset({
          accountId: acc,
          collateralId,
          fireblocksAssetId,
          requestBody,
        });
      } catch (err) {
        if (err instanceof ApiError) {
          return err;
        }
        throw err;
      }
      throw new Error('Expected to throw');
    };

    it('create collateral deposit address request should return with a valid schema', async () => {
      const collateralAddresses = await client.collateral.createCollateralDepositAddressForAsset({
        accountId,
        collateralId,
        fireblocksAssetId,
        requestBody: {
          ...address,
        },
      });
      expect(collateralAddresses).toHaveProperty('addresses');
      expect(collateralAddresses.addresses).toBeArray();

      collateralAddresses.addresses.forEach((address) => {
        expect(typeof address.id).toBe('string');

        const addressObj = address.address;
        const assetObj = address.asset;

        expect(typeof address.fireblocksAssetId).toBe('string');
        expect(typeof address.recoveryAccountId).toBe('string');
        expect(typeof addressObj.transferMethod).toBe('string');
        expect(Object.values(PublicBlockchainCapability.transferMethod)).toContain(
          addressObj.transferMethod
        );
        expect(typeof addressObj.address).toBe('string');
        expect(typeof addressObj.addressTag).toBe('string');
        if (assetObj['assetId'] === 'undefined') {
          expect(Object.values(Blockchain)).toContain(assetObj['blockchain']);
          expect(Object.values(CryptocurrencySymbol)).toContain(assetObj['cryptocurrencySymbol']);
          expect(typeof assetObj['testAsset']).toBe('boolean');
        }
        if (addressObj.asset['assetId'] === 'undefined') {
          expect(Object.values(Blockchain)).toContain(addressObj.asset['blockchain']);
          expect(Object.values(CryptocurrencySymbol)).toContain(
            addressObj.asset['cryptocurrencySymbol']
          );
          expect(typeof addressObj.asset['testAsset']).toBe('boolean');
        }
        if (addressObj.asset['assetId'] === assetObj['assetId']) {
          expect(assetObj).toEqual(addressObj.asset);
        }
      });
    });

    it('create collateral deposit address no tag request should return with a valid schema', async () => {
      const newAddress = { ...address } as any;
      delete newAddress.address.addressTag;
      const collateralAddresses = await client.collateral.createCollateralDepositAddressForAsset({
        accountId,
        collateralId,
        fireblocksAssetId,
        requestBody: {
          ...newAddress,
        },
      });
      expect(collateralAddresses).toHaveProperty('addresses');
      expect(collateralAddresses.addresses).toBeArray();

      collateralAddresses.addresses.forEach((address) => {
        expect(typeof address.address['addressTag']).toBe('undefined');
      });
    });

    it('create collateral deposit address request should fail with Not Found', async () => {
      const reqBody: CollateralAddress = address;

      const error = await CreateCollateralAccountLinksFailureResult('1', reqBody);

      expect(error.status).toBe(404);
      expect(error.body.errorType).toBe(GeneralError.errorType.NOT_FOUND);
      expect(error.body.requestPart).toBe(undefined);
    });

    it('create collateral deposit address request should fail schema property', async () => {
      const reqBody: CollateralAddress = address;
      reqBody.address.asset['assetId'] = 2;
      const error = await CreateCollateralAccountLinksFailureResult('1', reqBody);

      expect(error.status).toBe(400);
      expect(error.body.errorType).toBe(BadRequestError.errorType.SCHEMA_PROPERTY_ERROR);
      expect(error.body.requestPart).toBe(RequestPart.BODY);
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
        const assetObj = collateralAccountAddress.asset;

        expect(typeof collateralAccountAddress.id).toBe('string');
        expect(typeof collateralAccountAddress.fireblocksAssetId).toBe('string');
        expect(typeof collateralAccountAddress.recoveryAccountId).toBe('string');
        expect(typeof addressObj.transferMethod).toBe('string');
        expect(Object.values(PublicBlockchainCapability.transferMethod)).toContain(
          addressObj.transferMethod
        );
        expect(typeof addressObj.address).toBe('string');
        if (addressObj.addressTag) expect(typeof addressObj.addressTag).toBe('string');
        if (assetObj['assetId'] === 'undefined') {
          expect(Object.values(Blockchain)).toContain(assetObj['blockchain']);
          expect(Object.values(CryptocurrencySymbol)).toContain(assetObj['cryptocurrencySymbol']);
          expect(typeof assetObj['testAsset']).toBe('boolean');
        }
        if (addressObj.asset['assetId'] === 'undefined') {
          expect(Object.values(Blockchain)).toContain(addressObj.asset['blockchain']);
          expect(Object.values(CryptocurrencySymbol)).toContain(
            addressObj.asset['cryptocurrencySymbol']
          );
          expect(typeof addressObj.asset['testAsset']).toBe('boolean');
        }
        if (addressObj.asset['assetId'] === assetObj['assetId']) {
          expect(assetObj).toEqual(addressObj.asset);
        }
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

  describe('get collateral deposit addresses for asset', () => {
    const GetCollateralDepositAddressesForAssetFailureResult = async (
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
        await client.collateral.getCollateralDepositAddressesForAsset({
          accountId: accId,
          collateralId,
          fireblocksAssetId,
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

    it('collateral deposit address for asset should return with a valid schema', async () => {
      const getCollateralDepositAddressesForAsset: Pageable<CollateralAddress> = async (
        limit,
        startingAfter?
      ) => {
        limit = 10;
        const response = await client.collateral.getCollateralDepositAddressesForAsset({
          accountId,
          collateralId,
          fireblocksAssetId,
          limit,
          startingAfter,
        });
        return response.addresses;
      };

      for await (const collateralAccountAddress of paginated(
        getCollateralDepositAddressesForAsset
      )) {
        const addressObj = collateralAccountAddress.address;

        expect(typeof collateralAccountAddress.id).toBe('string');
        expect(typeof collateralAccountAddress.recoveryAccountId).toBe('string');
        expect(typeof addressObj.transferMethod).toBe('string');
        expect(Object.values(PublicBlockchainCapability.transferMethod)).toContain(
          addressObj.transferMethod
        );
        expect(typeof addressObj.address).toBe('string');
        if (addressObj.addressTag) expect(typeof addressObj.addressTag).toBe('string');
        if (addressObj.asset['assetId'] === 'undefined') {
          expect(Object.values(Blockchain)).toContain(addressObj.asset['blockchain']);
          expect(Object.values(CryptocurrencySymbol)).toContain(
            addressObj.asset['cryptocurrencySymbol']
          );
          expect(typeof addressObj.asset['testAsset']).toBe('boolean');
        }
      }
    });

    it('request should fail with Not Found', async () => {
      const error = await GetCollateralDepositAddressesForAssetFailureResult(404);

      expect(error.status).toBe(404);
      expect(error.body.errorType).toBe(GeneralError.errorType.NOT_FOUND);
      expect(error.body.requestPart).toBe(undefined);
    });

    it('request should fail schema property', async () => {
      const error = await GetCollateralDepositAddressesForAssetFailureResult(400);

      expect(error.status).toBe(400);
      expect(error.body.errorType).toBe(BadRequestError.errorType.SCHEMA_PROPERTY_ERROR);
      expect(error.body.requestPart).toBe(RequestPart.QUERYSTRING);
    });
  });
});
