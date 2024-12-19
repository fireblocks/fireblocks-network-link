import {
  Blockchain,
  CryptocurrencySymbol,
  CollateralAssetAddress,
  PublicBlockchainCapability,
  CollateralAddress,
  ApiError,
} from '../../../../src/client/generated';
import { getCapableAccountId } from '../../../utils/capable-accounts';
import { Pageable, paginated } from '../../../utils/pagination';
import Client from '../../../../src/client';
import config from '../../../../src/config';

describe('Collateral Deposit Address', () => {
  const client = new Client();
  const accountId = getCapableAccountId('collateral');
  const collateralId = config.get('collateral.collateralAccount.accountId');

  describe('createCollateralDepositAddressForAsset', () => {
    it('should returned valid response', async () => {
      const requestBody: CollateralAddress = {
        address: {
          asset: {
            blockchain: Blockchain.BITCOIN,
            cryptocurrencySymbol: CryptocurrencySymbol.BTC,
            testAsset: false,
          },
          transferMethod: PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN,
          address: '0x0',
          addressTag: '555',
        },
        recoveryAccountId: 'id',
      };
      const collateralAddress = await client.collateral.createCollateralDepositAddressForAsset({
        accountId,
        collateralId,
        requestBody,
      });

        expect(collateralAddress['recoveryAccountId']).toBe('id');
        expect(collateralAddress.address['transferMethod']).toBe(
          PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN
        );
        expect(collateralAddress.address['address']).toBe('0x0');
        expect(collateralAddress.address['addressTag']).toBe('555');
        expect(collateralAddress.address.asset['blockchain']).toBe(Blockchain.BITCOIN);
        expect(collateralAddress.address.asset['cryptocurrencySymbol']).toBe(CryptocurrencySymbol.BTC);
        expect(collateralAddress.address.asset['testAsset']).toBe(false);
    });

    it('should return without tag', async () => {
      const requestBody: CollateralAddress = {
        address: {
          asset: {
            blockchain: Blockchain.BITCOIN,
            cryptocurrencySymbol: CryptocurrencySymbol.BTC,
            testAsset: false,
          },
          transferMethod: PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN,
          address: '0x0',
        },
        recoveryAccountId: 'id1',
      };
      const collateralAddress = await client.collateral.createCollateralDepositAddressForAsset({
        accountId,
        collateralId,
        requestBody,
      });

        expect(collateralAddress.address['addressTag']).toBe(undefined);
    });

    it('should return with assetId', async () => {
      const requestBody: CollateralAddress = {
        address: {
          asset: {
            assetId: 'ac123'
          },
          transferMethod: PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN,
          address: '0x0',
          addressTag: '555',
        },
        recoveryAccountId: 'id2',
      };
      const collateralAddress = await client.collateral.createCollateralDepositAddressForAsset({
        accountId,
        collateralId,
        requestBody,
      });

        expect(collateralAddress.address.asset['assetId']).toBe('ac123');
    });
  });

  describe('getCollateralDepositAddressesDetails', () => {
    it('should return with a valid schema', async () => {
      const collateralAddress = await client.collateral.getCollateralDepositAddressesDetails({
          accountId,
          collateralId,
          id: 'id',
        });

  
        const addressObj = collateralAddress.address;
        expect(collateralAddress['recoveryAccountId']).toBe('id');
        expect(addressObj['transferMethod']).toBe(
          PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN
        );
        expect(addressObj['address']).toBe('0x0');
        expect(addressObj['addressTag']).toBe('555');
        expect(addressObj.asset['blockchain']).toBe(Blockchain.BITCOIN);
        expect(addressObj.asset['cryptocurrencySymbol']).toBe(CryptocurrencySymbol.BTC);
        expect(addressObj.asset['testAsset']).toBe(false);
    });

    it('should return without tag', async () => {
        const collateralAddress = await client.collateral.getCollateralDepositAddressesDetails({
          accountId,
          collateralId,
          id: 'id1',
        });

        expect(collateralAddress.address['addressTag']).toBe(undefined);
    });

    it('should return with assetId', async () => {
      const collateralAddress = await client.collateral.getCollateralDepositAddressesDetails({
        accountId,
        collateralId,
        id: 'id2',
      });

      expect(collateralAddress.address.asset['assetId']).toBe('ac123');
  });
  });

  describe('getCollateralDepositAddresses', () => {
    it('simple valid response - one page', async () => {
      const singlePageResponse = await client.collateral.getCollateralDepositAddresses({
        accountId,
        collateralId,
      });

      for await (const collateralAccountAddress of singlePageResponse.addresses) {
        expect(collateralAccountAddress.address.transferMethod).toBe(
          PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN
        );
      }
    });

    it.each([
      { cryptocurrencySymbol: CryptocurrencySymbol.BTC },
      { assetId: 'ac123' },
      {},
    ])('multi page valid response with queryParams: %o', async (queryParams) => {
      const getCollateralDepositAddresses: Pageable<CollateralAssetAddress> = async (
        limit,
        startingAfter?
      ) => {
        const requestParams = {
          accountId,
          collateralId,
          limit,
          startingAfter,
          ...queryParams,
        };
        const response = await client.collateral.getCollateralDepositAddresses({
          ...requestParams,
        });
        return response.addresses;
      };

      for await (const collateralAccountAddress of paginated(getCollateralDepositAddresses)) {
        expect(collateralAccountAddress.address.transferMethod).toBe(
          PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN
        );

        Object.keys(queryParams).forEach((key) => {
          expect(collateralAccountAddress.address.asset[key]).toEqual(queryParams[key]);
        });
      }
    });
    it('should return error depositAddress for requested params not found', async () => {
      (async (limit, startingAfter?): Promise<ApiError> => {
        try {
          await client.collateral.getCollateralDepositAddresses({
            accountId,
            collateralId,
            limit,
            startingAfter,
            assetId: 'assetId',
          });
        } catch (err) {
          if (err instanceof ApiError) {
            return err;
          }
          throw err;
        }
        throw new Error('Expected to throw');
      })();
    });
  });
});
