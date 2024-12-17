import {
  CollateralDepositTransaction,
  CollateralDepositTransactions,
  CollateralDepositTransactionStatus,
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
    const depositDetails: CollateralDepositTransaction = {
      collateralTxId: collateralTxId,
      amount: '0.002',
      status: CollateralDepositTransactionStatus.PENDING,
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
      expect(collateralDepositTransaction.amount).toBe('0.002');
      expect(collateralDepositTransaction.status).toBe(CollateralDepositTransactionStatus.PENDING);
    });

    it('should return without amount', async () => {
      const newDetails = { ...depositDetails };
      delete newDetails.amount;
      newDetails.collateralTxId = `2.${accountId}.${uuid()}`;
      const collateralDepositTransaction =
        await client.collateral.registerCollateralDepositTransaction({
          accountId,
          collateralId,
          requestBody: {
            ...newDetails,
          },
        });

      expect(collateralDepositTransaction.amount).toBe(undefined);
    });

    it('should return without status', async () => {
      const newDetails = { ...depositDetails };
      delete newDetails.status;
      newDetails.collateralTxId = `2.${accountId}.${uuid()}`;
      const collateralDepositTransaction =
        await client.collateral.registerCollateralDepositTransaction({
          accountId,
          collateralId,
          requestBody: {
            ...newDetails,
          },
        });

      expect(collateralDepositTransaction.status).toBe(undefined);
    });

    it('should return without amount and status', async () => {
      const newDetails = { ...depositDetails };
      delete newDetails.amount;
      delete newDetails.status;
      newDetails.collateralTxId = `2.${accountId}.${uuid()}`;
      const collateralDepositTransaction =
        await client.collateral.registerCollateralDepositTransaction({
          accountId,
          collateralId,
          requestBody: {
            ...newDetails,
          },
        });

      expect(collateralDepositTransaction.amount).toBe(undefined);
      expect(collateralDepositTransaction.status).toBe(undefined);
    });
  });

  describe('getCollateralDepositTransactions', () => {
    it('should return valid response', async () => {
      const getCollateralDepositTransactions: Pageable<CollateralDepositTransactions> = async (
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
        expect(collateralDepositTransaction).toHaveProperty('id');
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
      expect(collateralDepositTransaction.amount).toBe('0.002');
      expect(collateralDepositTransaction.status).toBe(CollateralDepositTransactionStatus.PENDING);
    });
  });
});
