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
  const collateralId = config.get('collateral.signers.userId');

  describe('createCollateralDepositAddressForAsset', () => {
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

    it('should returned valid response', async () => {
      const collateralAddresses = await client.collateral.createCollateralDepositAddressForAsset({
        accountId,
        collateralId,
        requestBody,
      });

      collateralAddresses.addresses.forEach((address) => {
        expect(address['recoveryAccountId']).toBe('id');
        expect(address.address['transferMethod']).toBe(
          PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN
        );
        expect(address.address['address']).toBe('0x0');
        expect(address.address['addressTag']).toBe('555');
        expect(address.address.asset['blockchain']).toBe(Blockchain.BITCOIN);
        expect(address.address.asset['cryptocurrencySymbol']).toBe(CryptocurrencySymbol.BTC);
        expect(address.address.asset['testAsset']).toBe(false);
      });
    });

    it('should return without tag', async () => {
      delete requestBody.address.addressTag;
      const collateralAddresses = await client.collateral.createCollateralDepositAddressForAsset({
        accountId,
        collateralId,
        requestBody,
      });

      collateralAddresses.addresses.forEach((address) => {
        expect(address.address['addressTag']).toBe(undefined);
      });
    });
  });

  describe('getCollateralDepositAddressesDetails', () => {
    it('should return with a valid schema', async () => {
      const getCollateralDepositAddressesForAsset: Pageable<CollateralAddress> = async (
        limit,
        startingAfter?
      ) => {
        const response = await client.collateral.getCollateralDepositAddressesDetails({
          accountId,
          collateralId,
          id: accountId,
          limit,
          startingAfter,
        });
        return response.addresses;
      };

      for await (const collateralAccountAddress of paginated(
        getCollateralDepositAddressesForAsset
      )) {
        const addressObj = collateralAccountAddress.address;
        expect(collateralAccountAddress['recoveryAccountId']).toBe('id');
        expect(addressObj['transferMethod']).toBe(
          PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN
        );
        expect(addressObj['address']).toBe('0x0');
        expect(addressObj['addressTag']).toBe('555');
        expect(addressObj.asset['blockchain']).toBe(Blockchain.BITCOIN);
        expect(addressObj.asset['cryptocurrencySymbol']).toBe(CryptocurrencySymbol.BTC);
        expect(addressObj.asset['testAsset']).toBe(false);
      }
    });

    it('should return without tag', async () => {
      const getCollateralDepositAddressesForAsset: Pageable<CollateralAddress> = async (
        limit,
        startingAfter?
      ) => {
        const response = await client.collateral.getCollateralDepositAddressesDetails({
          accountId,
          collateralId,
          id: '111',
          limit,
          startingAfter,
        });
        return response.addresses;
      };

      for await (const collateralAccountAddress of paginated(
        getCollateralDepositAddressesForAsset
      )) {
        expect(collateralAccountAddress.address['addressTag']).toBe(undefined);
      }
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
      { cryptocurrencySymbol: CryptocurrencySymbol.BTC, blockchain: Blockchain.BITCOIN },
      { cryptocurrencySymbol: CryptocurrencySymbol.BTC },
      { blockchain: Blockchain.BITCOIN },
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
            cryptocurrencySymbol: CryptocurrencySymbol.ALGO,
            blockchain: Blockchain.BITCOIN_CASH_ABC,
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
