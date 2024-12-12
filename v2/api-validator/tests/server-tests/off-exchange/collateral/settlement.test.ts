import { SettlementRequest } from '../../../../src/client/generated';
import { getCapableAccountId } from '../../../utils/capable-accounts';
import { v4 as uuid } from 'uuid';
import Client from '../../../../src/client';

describe('Collateral Settlements', () => {
  const client: Client = new Client();
  const accountId = getCapableAccountId('collateral');
  const collateralId = `${uuid()}.${accountId}.${uuid()}`;
  const settlementVersion = accountId;

  describe('initiateSettlement', () => {
    it('Should return valid scheme with settlementVersion', async () => {
      const collateralSettlement = await client.collateral.initiateSettlement({
        accountId,
        collateralId,
        requestBody: {
          settlementId: uuid(),
          settlementVersion: settlementVersion,
        },
      });
      expect(collateralSettlement.settlementVersion).toBe(settlementVersion);
    });
  });

  describe('getCurrentSettlementInstructions', () => {
    it('Should return with a valid schema', async () => {
      const collateralSettlement = await client.collateral.getCurrentSettlementInstructions({
        accountId,
        collateralId,
      });
      expect(!!collateralSettlement).toBe(true);
    });
  });

  describe('getSettlementDetails', () => {
    it('Should return with a valid schema', async () => {
      const collateralSettlementDetails = await client.collateral.getSettlementDetails({
        accountId,
        collateralId,
        settlementVersion,
      });

      if (!collateralSettlementDetails['depositTransactions']) {
        expect(collateralSettlementDetails).toHaveProperty('withdrawTransactions');
      } else {
        expect(collateralSettlementDetails).toHaveProperty('depositTransactions');
      }
    });
  });
});
