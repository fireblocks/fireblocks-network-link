import {
  CollateralDepositTransaction,
  CollateralDepositTransactions,
  CollateralDepositTransactionStatus,
} from '../../../../src/client/generated';
import { getCapableAccountId } from '../../../utils/capable-accounts';
import { v4 as uuid } from 'uuid';
import { Pageable, paginated } from '../../../utils/pagination';
import Client from '../../../../src/client';

describe('Collateral Deposit', () => {
  let client: Client;
  let accountId: string;
  let collateralId: string;
  let fireblocksAssetId: string;
  let collateralTxId: string;
  let depositDetails: CollateralDepositTransaction;

  beforeAll(async () => {
    client = new Client();
    accountId = getCapableAccountId('collateral');
    fireblocksAssetId = uuid();
    collateralId = `${uuid()}.${accountId}.${uuid()}`;
    collateralTxId = `2.${accountId}.${uuid()}`;
    depositDetails = {
      collateralTxId: collateralTxId,
      fireblocksAssetId: fireblocksAssetId,
      amount: '0.002',
      status: CollateralDepositTransactionStatus.PENDING,
    };
  });

  describe('create collateral deposit transaction', () => {
    it('Request should return with a valid schema', async () => {
      const collateralDepositTransaction =
        await client.collateral.registerCollateralDepositTransaction({
          accountId,
          collateralId,
          requestBody: {
            ...depositDetails,
          },
        });

      expect(collateralDepositTransaction.collateralTxId).toBe(collateralTxId);
      expect(collateralDepositTransaction.fireblocksAssetId).toBe(fireblocksAssetId);
      expect(collateralDepositTransaction.amount).toBe('0.002');
      expect(collateralDepositTransaction.status).toBe(CollateralDepositTransactionStatus.PENDING);
    });

    it('Reques without amount should return with a valid schema', async () => {
      const newDetails = { ...depositDetails };
      delete newDetails.amount;
      newDetails.collateralTxId = `0.${accountId}.${uuid()}`;
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

    it('Request without status should return with a valid schema', async () => {
      const newDetails = { ...depositDetails };
      delete newDetails.status;
      newDetails.collateralTxId = `0.${accountId}.${uuid()}`;
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

    it('Request without amount and status should return with a valid schema', async () => {
      const newDetails = { ...depositDetails };
      delete newDetails.amount;
      delete newDetails.status;
      newDetails.collateralTxId = `0.${accountId}.${uuid()}`;
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

  describe('get collateral deposit transactions', () => {
    it('should return with a valid schema', async () => {
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
        expect(!!collateralDepositTransaction).toBe(true);
      }
    });
  });

  describe('get collateral deposit transaction details', () => {
    it('should return with a valid schema', async () => {
      const collateralDepositTransaction =
        await client.collateral.getCollateralDepositTransactionDetails({
          accountId,
          collateralId,
          collateralTxId,
        });

      expect(collateralDepositTransaction.collateralTxId).toEqual(collateralTxId);
      expect(collateralDepositTransaction.fireblocksAssetId).toBe(fireblocksAssetId);
      expect(collateralDepositTransaction.amount).toBe('0.002');
      expect(collateralDepositTransaction.status).toBe(CollateralDepositTransactionStatus.PENDING);
    });
  });
});
