import { randomUUID } from 'crypto';
import { UnknownAdditionalAssetError } from '../../src/server/controllers/assets-controller';
import {
  DepositAddress,
  DepositAddressStatus,
  Layer1Cryptocurrency,
  PublicBlockchainCapability,
} from '../../src/client/generated';
import {
  DepositAddressDisabledError,
  DepositController,
} from '../../src/server/controllers/deposit-controller';

describe('Deposit controller', () => {
  describe('Deposit addresses', () => {
    let depositController: DepositController;
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
      depositController = new DepositController();
    });

    describe('Add new deposit address', () => {
      beforeEach(() => {
        depositController.addNewDepositAddress(depositAddress1);
      });

      it('should add address when address list is empty', () => {
        expect(depositController.getDepositAddresses()).toEqual([depositAddress1]);
      });

      it('should add to existing deposit address list', () => {
        depositController.addNewDepositAddress(depositAddress2);
        expect(depositController.getDepositAddresses()).toEqual([depositAddress1, depositAddress2]);
      });
    });

    describe('Get deposit addresses', () => {
      it('should return address list set', () => {
        depositController.addNewDepositAddress(depositAddress1);
        expect(depositController.getDepositAddresses()).toEqual([depositAddress1]);
      });
    });

    describe('Disable deposit address', () => {
      beforeEach(() => {
        depositController.addNewDepositAddress(Object.assign({}, depositAddress1));
        depositController.disableDepositAddress(depositAddress1.id);
      });

      it('should set the deposit address status to disabled', () => {
        const disabledDepositAddress = depositController.getDepositAddress(depositAddress1.id);
        expect(disabledDepositAddress?.status).toBe(DepositAddressStatus.DISABLED);
      });

      it('should fail to disable an already disabled address', () => {
        expect(() => depositController.disableDepositAddress(depositAddress1.id)).toThrowError(
          DepositAddressDisabledError
        );
      });
    });
  });

  describe('Validate deposit address creation request', () => {
    const depositController = new DepositController();
    const unknownAssetReference = { assetId: randomUUID() };
    const unknownAssetTransferCapability = {
      transferMethod: PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN,
      asset: unknownAssetReference,
    };

    it('should throw error when unknown asset is provided', () => {
      expect(() => {
        depositController.validateDepositAddressCreationRequest({
          idempotencyKey: randomUUID(),
          transferMethod: unknownAssetTransferCapability,
        });
      }).toThrow(UnknownAdditionalAssetError);
    });
  });
});
