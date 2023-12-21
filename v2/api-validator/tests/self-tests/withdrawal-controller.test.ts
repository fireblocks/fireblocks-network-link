import { fakeSchemaObject } from '../../src/schemas';
import {
  PeerAccountWithdrawalRequest,
  Withdrawal,
  WithdrawalCapability,
} from '../../src/client/generated';
import { WithdrawalController } from '../../src/server/controllers/withdrawal-controller';
import _ from 'lodash';

describe('Withdrawal controller', () => {
  let controller: WithdrawalController;

  beforeAll(() => {
    controller = new WithdrawalController();
  });

  describe('List withdrawals', () => {
    const orderOptions: ('asc' | 'desc')[] = ['asc', 'desc'];
    it.each(orderOptions)('should return withdrawals ordered by creation date', (order) => {
      const withdrawals = controller.getWithdrawals(order);
      expect(withdrawals).toEqual(_.orderBy(withdrawals, 'createdAt', order));
    });
  });

  describe('Create withdrawal', () => {
    let withdrawal: Withdrawal;
    let capability: WithdrawalCapability | undefined;
    beforeAll(() => {});
    it('should add withdrawal to account withdrawals', () => {
      const withdrawalRequest = fakeSchemaObject(
        'PeerAccountWithdrawalRequest'
      ) as PeerAccountWithdrawalRequest;
      capability = controller
        .getCapabilites()
        .find((c) =>
          _.isEqual(c.withdrawal.transferMethod, withdrawalRequest.destination.transferMethod)
        );
      if (capability !== undefined) {
        withdrawalRequest.balanceAsset = capability.balanceAsset;
        withdrawal = controller.createWithdrawal(withdrawalRequest);
        expect(controller.getWithdrawal(withdrawal.id)).toBeDefined();
      }
    });
  });
});
