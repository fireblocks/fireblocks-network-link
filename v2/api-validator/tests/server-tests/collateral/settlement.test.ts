import { getCapableAccountId, hasCapability } from '../../utils/capable-accounts';
import {
  SettlementInstructions,
  SettlementState,
  SettlementDepositInstruction,
  SettlementWithdrawInstruction,
} from '../../../src/client/generated';
import { v4 as uuid } from 'uuid';
import config from '../../../src/config';
import Client from '../../../src/client';

const noCollateralCapability = !hasCapability('transfers');

describe.skipIf(noCollateralCapability)('Collateral Settlements', () => {
  const client: Client = new Client();
  const accountId: string = getCapableAccountId('collateral');
  const collateralId: string = config.get('collateral.signers.userId');

  describe('Check full settlement flow', () => {
    let settlementVersion: string;
    let depositInstructions: SettlementDepositInstruction[];
    let withdrawInstructions: SettlementWithdrawInstruction[];

    it('Get current settlement should return with a valid response', async () => {
      const collateralSettlement: SettlementInstructions =
        await client.collateral.getCurrentSettlementInstructions({
          accountId,
          collateralId,
        });

      expect(!!collateralSettlement).toBe(true);

      settlementVersion = collateralSettlement.settlementVersion;
      depositInstructions = collateralSettlement.depositInstructions;
      withdrawInstructions = collateralSettlement.withdrawInstructions;
    });

    it('Get by settlementVersion request should return with a valid response', async () => {
      const collateralSettlementDetails: SettlementState =
        await client.collateral.getSettlementDetails({
          accountId,
          collateralId,
          settlementVersion,
        });

      expect(collateralSettlementDetails.settlementVersion).toBe(settlementVersion);
      if (collateralSettlementDetails.depositTransactions) {
        for (const index in collateralSettlementDetails.depositTransactions.entries()) {
          expect(collateralSettlementDetails.depositTransactions[index].destinationAddress).toEqual(
            depositInstructions[index].destinationAddress
          );
          expect(collateralSettlementDetails.depositTransactions[index].amount).toBe(
            depositInstructions[index].amount
          );
        }
      }
      if (collateralSettlementDetails.withdrawTransactions) {
        for (const index in collateralSettlementDetails.withdrawTransactions.entries()) {
          expect(collateralSettlementDetails.withdrawTransactions[index].sourceAddress).toEqual(
            withdrawInstructions[index].sourceAddress
          );
          expect(collateralSettlementDetails.withdrawTransactions[index].amount).toBe(
            withdrawInstructions[index].amount
          );
        }
      }
    });

    it('Initiate request should return valid response', async () => {
      const collateralSettlement: SettlementInstructions =
        await client.collateral.initiateSettlement({
          accountId,
          collateralId,
          requestBody: {
            settlementId: uuid(),
            settlementVersion: settlementVersion,
          },
        });

      expect(collateralSettlement.settlementVersion).toBe(settlementVersion);
      expect(collateralSettlement.depositInstructions).toEqual(depositInstructions);
      expect(collateralSettlement.withdrawInstructions).toEqual(withdrawInstructions);
    });
  });
});
