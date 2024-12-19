import { getCapableAccountId } from '../../../utils/capable-accounts';
import { v4 as uuid } from 'uuid';
import config from '../../../../src/config';
import Client from '../../../../src/client';

describe('Collateral Settlements', () => {
  const client: Client = new Client();
  const accountId = getCapableAccountId('collateral');
  const collateralId = config.get('collateral.signers.userId');
  const settlementVersion = accountId;

  describe('initiateSettlement', () => {
    it('should return valid response with settlementVersion', async () => {
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
    it('should return with a valid response', async () => {
      const collateralSettlement = await client.collateral.getCurrentSettlementInstructions({
        accountId,
        collateralId,
      });
      expect(!!collateralSettlement).toBe(true);
    });
  });

  describe('getSettlementDetails', () => {
    it('should return with a valid response', async () => {
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
