import { getCapableAccountId } from '../../../utils/capable-accounts';
import { SettlementInstructions, SettlementState } from '../../../../src/client/generated';
import { v4 as uuid } from 'uuid';
import config from '../../../../src/config';
import Client from '../../../../src/client';

describe('Collateral Settlements', () => {
  const client: Client = new Client();
  const accountId: string = getCapableAccountId('collateral');
  const collateralId: string = config.get('collateral.signers.userId');

  describe('Initiate a settlement request & fetch by settlementVersion', () => {
    let settlementVersion; // should be type string will be added/modified after schema change
    it('Initiate request should return valid response', async () => {
      const collateralSettlement: SettlementInstructions = await client.collateral.initiateSettlement({
        accountId,
        collateralId,
        requestBody: {
          settlementId: uuid(),
          settlementVersion: uuid(),
        },
      });
      
      expect(collateralSettlement).toHaveProperty('settlementVersion');
      settlementVersion = collateralSettlement.settlementVersion;

    });

    it('Get request should return with a valid response', async () => {
      const collateralSettlementDetails: SettlementState = await client.collateral.getSettlementDetails({
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

  describe('Get current Instructions for settlement', () => {
    it('Should return with a valid response', async () => {
      const collateralSettlement: SettlementInstructions = await client.collateral.getCurrentSettlementInstructions({
        accountId,
        collateralId,
      });
      expect(!!collateralSettlement).toBe(true);
    });
  });
});
