import Client from '../../../../src/client';
import { getCapableAccountId } from '../../../utils/capable-accounts';
import { SettlementRequest } from '../../../../src/client/generated';
import { v4 as uuid } from 'uuid';

describe('Collateral Settlements', () => {
  let client: Client;
  let accountId: string;
  let collateralId: string;
  let settlementVersion: string;
  let settlementlDetails: SettlementRequest;

  beforeAll(async () => {
    client = new Client();
    accountId = getCapableAccountId('collateral');
    collateralId = `${uuid()}.${accountId}.${uuid()}`;
    settlementVersion = accountId;
    settlementlDetails = {
      settlementId: uuid(),
      settlementVersion: settlementVersion,
    };
  });

  describe('Initiate settlement', () => {
    it('Should return valid scheme with settlementVersion', async () => {
      const collateralSettlement = await client.collateral.initiateSettlement({
        accountId,
        collateralId,
        requestBody: {
          ...settlementlDetails,
        },
      });
      expect(collateralSettlement.settlementVersion).toBe(settlementVersion);
    });
  });

  describe('Get current settlement instructions', () => {
    it('Should return with a valid schema', async () => {
      const collateralSettlement = await client.collateral.getCurrentSettlementInstructions({
        accountId,
        collateralId,
      });
      expect(!!collateralSettlement).toBe(true);
    });
  });

  describe('get settlement details', () => {
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
