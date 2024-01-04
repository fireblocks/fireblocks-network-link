import {
  DepositAddress,
  DepositAddressStatus,
  CryptocurrencySymbol,
  PublicBlockchainCapability,
} from '../../src/client/generated';
import {
  DepositAddressDisabledError,
  DepositController,
} from '../../src/server/controllers/deposit-controller';

describe('Deposit controller', () => {
  describe('Deposit addresses', () => {
    let depositController: DepositController;
    const depositAddress: DepositAddress = {
      id: 'id1',
      status: DepositAddressStatus.ENABLED,
      destination: {
        transferMethod: PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN,
        asset: { cryptocurrencySymbol: CryptocurrencySymbol.ETH },
        address: 'address1',
      },
    };
    beforeEach(() => {
      depositController = new DepositController();
    });

    describe('Add new deposit address', () => {
      beforeEach(() => {
        depositController.addNewDepositAddress(depositAddress);
      });

      it('should find added address', () => {
        expect(depositController.getDepositAddresses()).toContain(depositAddress);
      });
    });

    describe('Disable deposit address', () => {
      beforeEach(() => {
        depositController.addNewDepositAddress(Object.assign({}, depositAddress));
        depositController.disableDepositAddress(depositAddress.id);
      });

      it('should set the deposit address status to disabled', () => {
        const disabledDepositAddress = depositController.getDepositAddress(depositAddress.id);
        expect(disabledDepositAddress?.status).toBe(DepositAddressStatus.DISABLED);
      });

      it('should fail to disable an already disabled address', () => {
        expect(() => depositController.disableDepositAddress(depositAddress.id)).toThrowError(
          DepositAddressDisabledError
        );
      });
    });
  });
});
