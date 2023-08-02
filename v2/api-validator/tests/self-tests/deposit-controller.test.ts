import { randomUUID } from 'crypto';
import { UnknownAdditionalAssetError } from '../../src/server/controllers/assets-controller';
import { IdempotencyKeyReuseError } from '../../src/server/controllers/orders-controller';
import {
  DepositAddress,
  DepositAddressStatus,
  Layer1Cryptocurrency,
  PublicBlockchainCapability,
} from '../../src/client/generated';
import {
  addNewDepositAddressForAccount,
  DepositAddressDisabledError,
  disableAccountDepositAddress,
  getAccountDepositAddresses,
  IdempotencyRequestError,
  registerIdempotencyResponse,
  validateDepositAddressCreationRequest,
} from '../../src/server/controllers/deposit-controller';

describe('Deposit controller', () => {
  describe('Deposit addresses', () => {
    const accountDepositAddressMap: Map<string, DepositAddress[]> = new Map();
    const accountId = 'some-account';
    const differentAccountId = 'different-account';
    const depositAddress: DepositAddress = {
      id: 'id',
      status: DepositAddressStatus.ENABLED,
      destination: {
        transferMethod: PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN,
        asset: { cryptocurrencySymbol: Layer1Cryptocurrency.ETH },
        address: 'address',
      },
    };

    afterEach(() => {
      accountDepositAddressMap.clear();
    });

    describe('Add new deposit address', () => {
      beforeEach(() => {
        addNewDepositAddressForAccount(accountId, depositAddress, accountDepositAddressMap);
      });

      it('should set address to relevant accountId when address list is empty', () => {
        expect(accountDepositAddressMap.get(accountId)).toEqual([depositAddress]);
      });

      it('should add to existing deposit address list', () => {
        addNewDepositAddressForAccount(accountId, depositAddress, accountDepositAddressMap);
        expect(accountDepositAddressMap.get(accountId)).toEqual([depositAddress, depositAddress]);
      });
    });

    describe("Get account's deposit addresses", () => {
      it('should return empty list when the account doesnt have any deposit addresses', () => {
        expect(getAccountDepositAddresses(accountId)).toEqual([]);
      });

      it('should return address list set for account', () => {
        accountDepositAddressMap.set(accountId, [depositAddress]);
        expect(getAccountDepositAddresses(accountId, accountDepositAddressMap)).toEqual([
          depositAddress,
        ]);
        expect(getAccountDepositAddresses(differentAccountId, accountDepositAddressMap)).toEqual(
          []
        );
      });
    });

    describe('Disable deposit address', () => {
      beforeEach(() => {
        accountDepositAddressMap.set(accountId, [depositAddress]);
        disableAccountDepositAddress(accountId, depositAddress.id, accountDepositAddressMap);
      });

      it('should set the deposit address status to disabled', () => {
        const disabledDepositAddress = accountDepositAddressMap
          .get(accountId)
          ?.find((address) => address.id === depositAddress.id);
        expect(disabledDepositAddress?.status).toBe(DepositAddressStatus.DISABLED);
      });

      it('should fail attempting to disable an already disabled address', () => {
        expect(() => {
          disableAccountDepositAddress(accountId, depositAddress.id, accountDepositAddressMap);
        }).toThrow(DepositAddressDisabledError);
      });
    });
  });

  describe('Validate deposit address creation request', () => {
    const unknownAssetReference = { assetId: randomUUID() };
    const unknownAssetTransferCapability = {
      transferMethod: PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN,
      asset: unknownAssetReference,
    };
    const validTransferCapability = {
      transferMethod: PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN,
      asset: { cryptocurrencySymbol: Layer1Cryptocurrency.ETH },
    };

    it('should throw error when unknown asset is provided', () => {
      expect(() => {
        validateDepositAddressCreationRequest({
          idempotencyKey: randomUUID(),
          transferMethod: unknownAssetTransferCapability,
        });
      }).toThrow(UnknownAdditionalAssetError);
    });

    describe('Idempotency validation', () => {
      const idempotencyKey = 'key';
      registerIdempotencyResponse(idempotencyKey, {
        requestBody: {
          idempotencyKey,
          transferMethod: validTransferCapability,
        },
        responseStatus: 200,
        responseBody: {},
      });

      it('should throw idempotency request error when the same request is provided more than once', () => {
        expect(() => {
          validateDepositAddressCreationRequest({
            idempotencyKey,
            transferMethod: validTransferCapability,
          });
        }).toThrow(IdempotencyRequestError);
      });

      it('should throw idempotency key used error when the same key is sent with a different request body', () => {
        expect(() => {
          validateDepositAddressCreationRequest({
            idempotencyKey,
            transferMethod: unknownAssetTransferCapability,
          });
        }).toThrow(IdempotencyKeyReuseError);
      });
    });
  });
});
