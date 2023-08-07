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
  DepositAddressDisabledError,
  DepositController,
  IdempotencyRequestError,
} from '../../src/server/controllers/deposit-controller';

describe('Deposit controller', () => {
  describe('Deposit addresses', () => {
    let depositController: DepositController;
    const accountId = 'some-account';
    const differentAccountId = 'different-account';
    const depositAddress1: DepositAddress = {
      id: 'id1',
      status: DepositAddressStatus.ENABLED,
      destination: {
        transferMethod: PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN,
        asset: { cryptocurrencySymbol: Layer1Cryptocurrency.ETH },
        address: 'address1',
      },
    };
    const depositAddress2: DepositAddress = {
      id: 'id2',
      status: DepositAddressStatus.ENABLED,
      destination: {
        transferMethod: PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN,
        asset: { cryptocurrencySymbol: Layer1Cryptocurrency.BTC },
        address: 'address2',
      },
    };

    beforeEach(() => {
      depositController = new DepositController([]);
    });

    describe('Add new deposit address', () => {
      beforeEach(() => {
        depositController.addNewDepositAddressForAccount(accountId, depositAddress1);
      });

      it('should set address to relevant accountId when address list is empty', () => {
        expect(depositController.getAccountDepositAddresses(accountId)).toEqual([depositAddress1]);
      });

      it('should add to existing deposit address list', () => {
        depositController.addNewDepositAddressForAccount(accountId, depositAddress2);
        expect(depositController.getAccountDepositAddresses(accountId)).toEqual([
          depositAddress1,
          depositAddress2,
        ]);
      });
    });

    describe("Get account's deposit addresses", () => {
      it('should return empty list when the account doesnt have any deposit addresses', () => {
        expect(depositController.getAccountDepositAddresses(accountId)).toEqual([]);
      });

      it('should return address list set for account', () => {
        depositController.addNewDepositAddressForAccount(accountId, depositAddress1);
        expect(depositController.getAccountDepositAddresses(accountId)).toEqual([depositAddress1]);
        expect(depositController.getAccountDepositAddresses(differentAccountId)).toEqual([]);
      });
    });

    describe('Disable deposit address', () => {
      beforeEach(() => {
        depositController.addNewDepositAddressForAccount(accountId, depositAddress1);
        depositController.disableAccountDepositAddress(accountId, depositAddress1.id);
      });

      it('should set the deposit address status to disabled', () => {
        const disabledDepositAddress = depositController.getAccountDepositAddress(
          accountId,
          depositAddress1.id
        );
        expect(disabledDepositAddress?.status).toBe(DepositAddressStatus.DISABLED);
      });

      it('should fail to disable an already disabled address', () => {
        expect(() =>
          depositController.disableAccountDepositAddress(accountId, depositAddress1.id)
        ).toThrow(DepositAddressDisabledError);
      });
    });
  });

  describe('Validate deposit address creation request', () => {
    const depositController = new DepositController([]);
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
        depositController.validateDepositAddressCreationRequest({
          idempotencyKey: randomUUID(),
          transferMethod: unknownAssetTransferCapability,
        });
      }).toThrow(UnknownAdditionalAssetError);
    });

    describe('Idempotency validation', () => {
      const idempotencyKey = 'key';
      depositController.registerIdempotencyResponse(idempotencyKey, {
        requestBody: {
          idempotencyKey,
          transferMethod: validTransferCapability,
        },
        responseStatus: 200,
        responseBody: {},
      });

      it('should throw idempotency request error when the same request is provided more than once', () => {
        expect(() => {
          depositController.validateDepositAddressCreationRequest({
            idempotencyKey,
            transferMethod: validTransferCapability,
          });
        }).toThrow(IdempotencyRequestError);
      });

      it('should throw idempotency key used error when the same key is sent with a different request body', () => {
        expect(() => {
          depositController.validateDepositAddressCreationRequest({
            idempotencyKey,
            transferMethod: unknownAssetTransferCapability,
          });
        }).toThrow(IdempotencyKeyReuseError);
      });
    });
  });
});
