import {
  CollateralDepositTransaction,
  CollateralDepositTransactionRequest,
  CollateralDepositTransactionsResponse,
} from '../../../../src/client/generated';
import { getCapableAccountId } from '../../../utils/capable-accounts';
import { v4 as uuid } from 'uuid';
import { Pageable, paginated } from '../../../utils/pagination';
import config from '../../../../src/config';
import Client from '../../../../src/client';

describe('Collateral Deposit', () => {
  const client: Client = new Client();
  const accountId: string = getCapableAccountId('collateral');
  const collateralId: string = config.get('collateral.signers.userId');
  const collateralTxId: string = `2.${accountId}.${uuid()}`;

  describe('Register collateral deposit transaction', () => {
    const depositDetails: CollateralDepositTransactionRequest = {
      collateralTxId: collateralTxId,
      amount: '0.002',
    };
    it('Should return valid response', async () => {
      const collateralDepositTransaction: CollateralDepositTransaction =
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

  describe('Get List of collateral deposit transactions', () => {
    it('Should return valid response', async () => {
      const getCollateralDepositTransactions: Pageable<CollateralDepositTransaction> = async (
        limit,
        startingAfter?
      ) => {
        const response: CollateralDepositTransactionsResponse = await client.collateral.getCollateralDepositTransactions({
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

  describe('Get a collateral deposit transaction details by collateraltxId', () => {
    it('Should return valid response', async () => {
      const collateralDepositTransaction: CollateralDepositTransaction =
        await client.collateral.getCollateralDepositTransactionDetails({
          accountId,
          collateralId,
          collateralTxId,
        });

      expect(collateralDepositTransaction.collateralTxId).toEqual(collateralTxId);
    });
  });
});
