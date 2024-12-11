import Client from '../../../../src/client';
import { getCapableAccountId } from '../../../utils/capable-accounts';
import { Pageable, paginated } from '../../../utils/pagination';
import {
  Blockchain,
  CryptocurrencySymbol,
  CollateralAssetAddress,
  PublicBlockchainCapability,
  CollateralAddress,
} from '../../../../src/client/generated';
import { v4 as uuid } from 'uuid';

describe('Collateral Deposit Address', () => {
  let client: Client;
  let accountId: string;
  let collateralId: string;
  let fireblocksAssetId: string;
  let address: CollateralAddress;

  beforeAll(async () => {
    client = new Client();
    accountId = getCapableAccountId('collateral');
    fireblocksAssetId = uuid();
    collateralId = `${uuid()}.${accountId}.${uuid()}`;
    address = {
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
  });

  describe('create collateral deposit address for asset', () => {
    it('Should returned valid response', async () => {
      const collateralAddresses = await client.collateral.createCollateralDepositAddressForAsset({
        accountId,
        collateralId,
        fireblocksAssetId,
        requestBody: {
          ...address,
        },
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

    it('Should have no tag', async () => {
      const newAddress = { ...address } as any;
      delete newAddress.address.addressTag;
      const collateralAddresses = await client.collateral.createCollateralDepositAddressForAsset({
        accountId,
        collateralId,
        fireblocksAssetId: '111',
        requestBody: {
          ...newAddress,
        },
      });

      collateralAddresses.addresses.forEach((address) => {
        expect(address.address['addressTag']).toBe(undefined);
      });
    });
  });

  describe('get collateral deposit addresses', () => {
    it('Should return valid schema', async () => {
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

  describe('get collateral deposit addresses for asset', () => {
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
    it('Should return with no tag', async () => {
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
});
