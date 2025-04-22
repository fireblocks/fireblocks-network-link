import {
  Blockchain,
  CollateralAddress,
  CollateralAssetAddress,
  CollateralDepositAddresses,
  CryptocurrencySymbol,
  PublicBlockchainCapability,
} from '../../../src/client/generated';
import { getCapableAccountId, hasCapability } from '../../utils/capable-accounts';
import { Pageable, paginated } from '../../utils/pagination';
import Client from '../../../src/client';
import config from '../../../src/config';

const noCollateralCapability = !hasCapability('collateral');

describe.skipIf(noCollateralCapability)('Collateral Deposit Address', () => {
  const client = new Client();
  const collateralId: string = config.get('collateral.collateralAccount.accountId');
  let assetId: string;
  let accountId: string;

  beforeAll(async () => {
    accountId = getCapableAccountId('collateral');
    const assetsResult = await client.capabilities.getAdditionalAssets({});
    assetId = assetsResult.assets[0]?.id;
  });

  describe('Create collateral deposit address & fetch by entityId', () => {
    describe('Full response check', () => {
      let resEntityId: string;
      const recoveryAccountId = '1';
      const address = 'J4NOFD4VBNJ35F2MEII4HRAADNPJ7QFYAKESYKSEWWGJUXG64IATUVZRMQ';
      const addressTag = '223797B6A324B30583C4';
      const blockchain = Blockchain.ALGORAND;
      const cryptocurrencySymbol = CryptocurrencySymbol.ALGO;
      const testAsset = false;

      const responseValidation = (collateralAddress) => {
        expect(collateralAddress['recoveryAccountId']).toBe(recoveryAccountId);
        expect(collateralAddress.address['address']).toBe(address);
        expect(collateralAddress.address['addressTag']).toBe(addressTag);
        expect(collateralAddress.address.asset['blockchain']).toBe(blockchain);
        expect(collateralAddress.address.asset['cryptocurrencySymbol']).toBe(cryptocurrencySymbol);
        expect(collateralAddress.address.asset['testAsset']).toBe(testAsset);
      };

      it('Create request should returned valid response', async () => {
        const requestBody: CollateralAddress = {
          address: {
            asset: {
              blockchain: blockchain,
              cryptocurrencySymbol: cryptocurrencySymbol,
              testAsset: testAsset,
            },
            transferMethod: PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN,
            address: address,
            addressTag: addressTag,
          },
          recoveryAccountId: recoveryAccountId,
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
  });
});
