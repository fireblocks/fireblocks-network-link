import {
  CollateralDepositTransaction,
  CollateralDepositTransactionRequest,
} from '../../../../src/client/generated';
import { getCapableAccountId } from '../../../utils/capable-accounts';
import { v4 as uuid } from 'uuid';
import { Pageable, paginated } from '../../../utils/pagination';
import config from '../../../../src/config';
import Client from '../../../../src/client';

describe('Collateral Deposit', () => {
  const client: Client = new Client();
  const accountId = getCapableAccountId('collateral');
  const collateralId = config.get('collateral.signers.userId');
  const collateralTxId = `2.${accountId}.${uuid()}`;

  describe('registerCollateralDepositTransaction', () => {
    const depositDetails: CollateralDepositTransactionRequest = {
      collateralTxId: collateralTxId,
      amount: '0.002',
    };
    it('Request should return valid response', async () => {
      const collateralDepositTransaction =
        await client.collateral.registerCollateralDepositTransaction({
          accountId,
          collateralId,
          requestBody: {
            ...depositDetails,
          },
        });

      expect(collateralDepositTransaction.collateralTxId).toBe(collateralTxId);
      if (collateralDepositTransaction.amount) {
        expect(collateralDepositTransaction.amount).toBe('0.002');
      }
    });
  });

  describe('getCollateralDepositTransactions', () => {
    it('should return valid response', async () => {
      const getCollateralDepositTransactions: Pageable<CollateralDepositTransaction> = async (
        limit,
        startingAfter?
      ) => {
        const response = await client.collateral.getCollateralDepositTransactions({
          accountId,
          collateralId,
          limit,
          startingAfter,
        });
        return response.transactions;
      };

      for await (const collateralDepositTransaction of paginated(
        getCollateralDepositTransactions
      )) {
        expect(!!collateralDepositTransaction).toBe(true);
      }
    });
  });

  describe('getCollateralDepositTransactionDetails', () => {
    it('should return valid response', async () => {
      const collateralDepositTransaction =
        await client.collateral.getCollateralDepositTransactionDetails({
          accountId,
          collateralId,
          collateralTxId,
        });

      expect(collateralDepositTransaction.collateralTxId).toEqual(collateralTxId);
    });
  });
});
