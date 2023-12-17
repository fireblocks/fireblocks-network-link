import { fakeSchemaObject } from '../../src/schemas';
import { PeerAccountWithdrawalRequest, Withdrawal } from '../../src/client/generated';
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
    beforeAll(() => {
      const withdrawalRequest = fakeSchemaObject(
        'PeerAccountWithdrawalRequest'
      ) as PeerAccountWithdrawalRequest;
      withdrawal = controller.createWithdrawal(withdrawalRequest);
    });
    it('should add withdrawal to account withdrawals', () => {
      expect(controller.getWithdrawal(withdrawal.id)).toBeDefined();
    });
  });
});
