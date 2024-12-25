import {
  Blockchain,
  CryptocurrencySymbol,
  CollateralAssetAddress,
  PublicBlockchainCapability,
  CollateralAddress,
  CollateralDepositAddresses,
  ApiError,
} from '../../../src/client/generated';
import { getCapableAccountId } from '../../utils/capable-accounts';
import { Pageable, paginated } from '../../utils/pagination';
import Client from '../../../src/client';
import config from '../../../src/config';

describe('Collateral Deposit Address', () => {
  const client = new Client();
  const accountId: string = getCapableAccountId('collateral');
  const collateralId: string = config.get('collateral.collateralAccount.accountId');
  let assetId: string;

  function fetchAssetId() {
    return client.capabilities
      .getAdditionalAssets({})
      .then((assetsList) => assetsList.assets[0]?.id ?? '');
  }
  fetchAssetId().then((id) => {
    assetId = id;
  });

  describe('Create collateral deposit address & fetch by entityId', () => {
    describe('Full response check', () => {
      let resEntityId: string;

      const responseValidation = (collateralAddress) => {
        expect(collateralAddress['recoveryAccountId']).toBe('1');
        expect(collateralAddress.address['address']).toBe(
          'J4NOFD4VBNJ35F2MEII4HRAADNPJ7QFYAKESYKSEWWGJUXG64IATUVZRMQ'
        );
        expect(collateralAddress.address['addressTag']).toBe('223797B6A324B30583C4');
        expect(collateralAddress.address.asset['blockchain']).toBe(Blockchain.ALGORAND);
        expect(collateralAddress.address.asset['cryptocurrencySymbol']).toBe(
          CryptocurrencySymbol.ALGO
        );
        expect(collateralAddress.address.asset['testAsset']).toBe(false);
      };

      it('Create request should returned valid response', async () => {
        const requestBody: CollateralAddress = {
          address: {
            asset: {
              blockchain: Blockchain.ALGORAND,
              cryptocurrencySymbol: CryptocurrencySymbol.ALGO,
              testAsset: false,
            },
            transferMethod: PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN,
            address: 'J4NOFD4VBNJ35F2MEII4HRAADNPJ7QFYAKESYKSEWWGJUXG64IATUVZRMQ',
            addressTag: '223797B6A324B30583C4',
          },
          recoveryAccountId: '1',
        };
        const collateralAddress: CollateralAssetAddress =
          await client.collateral.createCollateralDepositAddressForAsset({
            accountId,
            collateralId,
            requestBody,
          });

        resEntityId = collateralAddress.id;
        responseValidation(collateralAddress);
      });

      it('Get request should return with a valid schema', async () => {
        const collateralAddress: CollateralAssetAddress =
          await client.collateral.getCollateralDepositAddressesDetails({
            accountId,
            collateralId,
            id: resEntityId,
          });

        responseValidation(collateralAddress);
      });
    });

    describe('Without tag response check', () => {
      let resEntityId: string;

      it('Create request should return without tag', async () => {
        const requestBody: CollateralAddress = {
          address: {
            asset: {
              blockchain: Blockchain.BITCOIN,
              cryptocurrencySymbol: CryptocurrencySymbol.BTC,
              testAsset: false,
            },
            transferMethod: PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN,
            address: '18csoDRstrn2YqpxQMgnTh1BqgA1m9T9xQ',
          },
          recoveryAccountId: '1',
        };
        const collateralAddress: CollateralAssetAddress =
          await client.collateral.createCollateralDepositAddressForAsset({
            accountId,
            collateralId,
            requestBody,
          });
        resEntityId = collateralAddress.id;
        expect(collateralAddress.address['addressTag']).toBe(undefined);
      });

      it('Get request should return without tag', async () => {
        const collateralAddress: CollateralAssetAddress =
          await client.collateral.getCollateralDepositAddressesDetails({
            accountId,
            collateralId,
            id: resEntityId,
          });

        expect(collateralAddress.address['addressTag']).toBe(undefined);
      });
    });

    describe('With assetId response check', () => {
      let resEntityId: string;

      it('Create request should return with assetId', async () => {
        const requestBody: CollateralAddress = {
          address: {
            asset: {
              assetId: assetId,
            },
            transferMethod: PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN,
            address: '0x1Dd0386E43C0F66981e46C6e6A57E9d8919b6125',
          },
          recoveryAccountId: '1',
        };
        const collateralAddress: CollateralAssetAddress =
          await client.collateral.createCollateralDepositAddressForAsset({
            accountId,
            collateralId,
            requestBody,
          });
        resEntityId = collateralAddress.id;
        expect(collateralAddress.address.asset['assetId']).toBe(assetId);
      });

      it('Get should return with assetId', async () => {
        const collateralAddress: CollateralAssetAddress =
          await client.collateral.getCollateralDepositAddressesDetails({
            accountId,
            collateralId,
            id: resEntityId,
          });

        expect(collateralAddress.address.asset['assetId']).toBe(assetId);
      });
    });
  });

  describe('Get list of collateral account deposit addresses', () => {
    it('Simple valid response - one page', async () => {
      const singlePageResponse: CollateralDepositAddresses =
        await client.collateral.getCollateralDepositAddresses({
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
      async () => ({ assetId: await assetId }),
      {},
    ])('Multi page valid response with queryParams: %o', async (queryParams) => {
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
        const response: CollateralDepositAddresses =
          await client.collateral.getCollateralDepositAddresses({
            ...requestParams,
          });
        return response.addresses;
      };

      for await (const collateralAccountAddress of paginated(getCollateralDepositAddresses)) {
        Object.keys(queryParams).forEach((key) => {
          expect(collateralAccountAddress.address.asset[key]).toEqual(queryParams[key]);
        });
      }
    });

    it('Should return not found error depositAddress for requested params', async () => {
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
