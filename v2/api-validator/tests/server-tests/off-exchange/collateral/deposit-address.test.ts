import {
  Blockchain,
  CryptocurrencySymbol,
  CollateralAssetAddress,
  PublicBlockchainCapability,
  CollateralAddress,
} from '../../../../src/client/generated';
import { getCapableAccountId } from '../../../utils/capable-accounts';
import { v4 as uuid } from 'uuid';
import { Pageable, paginated } from '../../../utils/pagination';
import Client from '../../../../src/client';

describe('Collateral Deposit Address', () => {
  const client = new Client();
  const accountId = getCapableAccountId('collateral');
  const fireblocksAssetId = uuid();
  const collateralId = `${uuid()}.${accountId}.${uuid()}`;

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
      fireblocksAssetId: fireblocksAssetId,
    };

    it('Should returned valid response', async () => {
      const collateralAddresses = await client.collateral.createCollateralDepositAddressForAsset({
        accountId,
        collateralId,
        fireblocksAssetId,
        requestBody,
      });

      collateralAddresses.addresses.forEach((address) => {
        expect(address['recoveryAccountId']).toBe('id');
        expect(address['fireblocksAssetId']).toBe(fireblocksAssetId);
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

    it('Should return without tag', async () => {
      delete requestBody.address.addressTag;
      const collateralAddresses = await client.collateral.createCollateralDepositAddressForAsset({
        accountId,
        collateralId,
        fireblocksAssetId: '111',
        requestBody,
      });

      collateralAddresses.addresses.forEach((address) => {
        expect(address.address['addressTag']).toBe(undefined);
      });
    });
  });

  describe('getCollateralDepositAddressesForAsset', () => {
    it('Should return with a valid schema', async () => {
      const getCollateralDepositAddressesForAsset: Pageable<CollateralAddress> = async (
        limit,
        startingAfter?
      ) => {
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
        expect(collateralAccountAddress['recoveryAccountId']).toBe('id');
        expect(collateralAccountAddress['fireblocksAssetId']).toBe(fireblocksAssetId);
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

    it('Should return without tag', async () => {
      const getCollateralDepositAddressesForAsset: Pageable<CollateralAddress> = async (
        limit,
        startingAfter?
      ) => {
        const response = await client.collateral.getCollateralDepositAddressesForAsset({
          accountId,
          collateralId,
          fireblocksAssetId: '111',
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

    it('multi page valid response', async () => {
      const getCollateralDepositAddresses: Pageable<CollateralAssetAddress> = async (
        limit,
        startingAfter?
      ) => {
        const response = await client.collateral.getCollateralDepositAddresses({
          accountId,
          collateralId,
          limit,
          startingAfter,
        });
        return response.addresses;
      };

      for await (const collateralAccountAddress of paginated(getCollateralDepositAddresses)) {
        expect(collateralAccountAddress.address.transferMethod).toBe(
          PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN
        );
      }
    });
  });
});
