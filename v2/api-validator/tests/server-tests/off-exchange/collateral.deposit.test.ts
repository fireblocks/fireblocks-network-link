import Client from '../../../src/client';
import { getCapableAccountId, hasCapability } from '../../utils/capable-accounts';
import { Pageable, paginated } from '../../utils/pagination';
import {
  ApiError,
  GeneralError,
  CollateralDepositTransaction,
  CollateralDepositTransactionStatus,
} from '../../../src/client/generated';
import { randomUUID } from 'crypto';

const noCollateralapability = !hasCapability('collateral');

function isUUIDv4(uuid: string): boolean {
  const uuidv4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidv4Regex.test(uuid);
}

function isPositiveAmount(amount: string): boolean {
  const uuidv4Regex = /^\d+(\.\d+)?/i;
  return uuidv4Regex.test(amount);
}

describe.skipIf(noCollateralapability)('collateral', () => {
  let client: Client;
  let accountId: string;
  let collateralId: string;
  let fireblocksAssetId: string;
  let collateralTxId: string;
  let depositDetails: CollateralDepositTransaction;

  beforeAll(async () => {
    client = new Client();
    accountId = getCapableAccountId('collateral');
    fireblocksAssetId = randomUUID();
    collateralId = `${randomUUID()}.${accountId}.${randomUUID()}`;
    collateralTxId = `0.${accountId}.${randomUUID()}`;
    depositDetails = {
      id: accountId,
      collateralTxId: collateralTxId,
      fireblocksAssetId: fireblocksAssetId,
      amount: '0.002',
      status: CollateralDepositTransactionStatus.PENDING,
    };
  });

  describe('create collateral deposit transaction', () => {
    const registerCollateralDepositTransactionFailureResult = async (
      acc: string,
      requestBody: CollateralDepositTransaction
    ): Promise<ApiError> => {
      try {
        await client.collateral.registerCollateralDepositTransaction({
          accountId: acc,
          collateralId,
          requestBody,
        });
      } catch (err) {
        if (err instanceof ApiError) {
          return err;
        }
        throw err;
      }
      throw new Error('Expected to throw');
    };

    it('register collateral deposit transaction request should return with a valid schema', async () => {
      const collateralDepositTransaction =
        await client.collateral.registerCollateralDepositTransaction({
          accountId,
          collateralId,
          requestBody: {
            ...depositDetails,
          },
        });

      const splittedCollateralTxId = collateralDepositTransaction.collateralTxId.split('.');

      expect(typeof collateralDepositTransaction.collateralTxId).toBe('string');
      expect(splittedCollateralTxId.length).toBe(3);
      expect(splittedCollateralTxId[0]).toBe('0');
      expect(splittedCollateralTxId[1]).toBe(accountId);
      expect(isUUIDv4(splittedCollateralTxId[2])).toBe(true);

      expect(typeof collateralDepositTransaction.fireblocksAssetId).toBe('string');

      expect(typeof collateralDepositTransaction.amount).toBe('string');
      expect(collateralDepositTransaction.amount).toBe('0.002');
      expect(Object.values(CollateralDepositTransactionStatus)).toContain(
        collateralDepositTransaction.status
      );
    });

    it('register collateral deposit transaction reques with amount undefined should return with a valid schema', async () => {
      const newDetails = { ...depositDetails };
      delete newDetails.amount;

      const collateralDepositTransaction =
        await client.collateral.registerCollateralDepositTransaction({
          accountId,
          collateralId,
          requestBody: {
            ...newDetails,
          },
        });

      const splittedCollateralTxId = collateralDepositTransaction.collateralTxId.split('.');

      expect(typeof collateralDepositTransaction.collateralTxId).toBe('string');
      expect(splittedCollateralTxId.length).toBe(3);
      expect(splittedCollateralTxId[0]).toBe('0');
      expect(splittedCollateralTxId[1]).toBe(accountId);
      expect(isUUIDv4(splittedCollateralTxId[2])).toBe(true);

      expect(typeof collateralDepositTransaction.fireblocksAssetId).toBe('string');

      expect(collateralDepositTransaction.amount).toBe(undefined);
      expect(Object.values(CollateralDepositTransactionStatus)).toContain(
        collateralDepositTransaction.status
      );
    });

    it('register collateral deposit transaction request with status undefined should return with a valid schema', async () => {
      delete depositDetails.status;
      const collateralDepositTransaction =
        await client.collateral.registerCollateralDepositTransaction({
          accountId,
          collateralId,
          requestBody: {
            ...depositDetails,
          },
        });

      const splittedCollateralTxId = collateralDepositTransaction.collateralTxId.split('.');

      expect(typeof collateralDepositTransaction.collateralTxId).toBe('string');
      expect(splittedCollateralTxId.length).toBe(3);
      expect(splittedCollateralTxId[0]).toBe('0');
      expect(splittedCollateralTxId[1]).toBe(accountId);
      expect(isUUIDv4(splittedCollateralTxId[2])).toBe(true);

      expect(typeof collateralDepositTransaction.fireblocksAssetId).toBe('string');

      expect(typeof collateralDepositTransaction.amount).toBe('string');
      expect(collateralDepositTransaction.amount).toBe('0.002');
      expect(collateralDepositTransaction.status).toBe(undefined);
    });

    it('register collateral deposit transaction request with status and amount undefined should return with a valid schema', async () => {
      delete depositDetails.amount;
      const collateralDepositTransaction =
        await client.collateral.registerCollateralDepositTransaction({
          accountId,
          collateralId,
          requestBody: {
            ...depositDetails,
          },
        });

      const splittedCollateralTxId = collateralDepositTransaction.collateralTxId.split('.');

      expect(typeof collateralDepositTransaction.collateralTxId).toBe('string');
      expect(splittedCollateralTxId.length).toBe(3);
      expect(splittedCollateralTxId[0]).toBe('0');
      expect(splittedCollateralTxId[1]).toBe(accountId);
      expect(isUUIDv4(splittedCollateralTxId[2])).toBe(true);
      expect(typeof collateralDepositTransaction.fireblocksAssetId).toBe('string');

      expect(collateralDepositTransaction.amount).toBe(undefined);
      expect(collateralDepositTransaction.status).toBe(undefined);
    });

    it('register collateral deposit transaction request should fail with Not Found', async () => {
      const reqBody: CollateralDepositTransaction = depositDetails;
      const error = await registerCollateralDepositTransactionFailureResult('1', reqBody);

      expect(error.status).toBe(404);
      expect(error.body.errorType).toBe(GeneralError.errorType.NOT_FOUND);
      expect(error.body.requestPart).toBe(undefined);
    });
  });

  describe('get collateral deposit transactions', () => {
    const getCollateralDepositTransactionsFailureResult = async (
      accountId: string,
      limit?,
      startingAfter?
    ): Promise<ApiError> => {
      try {
        await client.collateral.getCollateralDepositTransactions({
          accountId,
          collateralId,
          limit,
          startingAfter: startingAfter,
        });
      } catch (err) {
        if (err instanceof ApiError) {
          return err;
        }
        throw err;
      }
      throw new Error('Expected to throw');
    };

    it('collateral deposit address should return with a valid schema', async () => {
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
        const splittedCollateralTxId = collateralDepositTransaction.collateralTxId.split('.');

        expect(typeof collateralDepositTransaction.collateralTxId).toBe('string');
        expect(splittedCollateralTxId.length).toBe(3);
        expect(splittedCollateralTxId[0]).toBe('0');
        expect(splittedCollateralTxId[1]).toBe(accountId);
        expect(isUUIDv4(splittedCollateralTxId[2])).toBe(true);

        expect(typeof collateralDepositTransaction.fireblocksAssetId).toBe('string');
        if (collateralDepositTransaction.amount) {
          expect(typeof collateralDepositTransaction.amount).toBe('string');
          expect(isPositiveAmount(collateralDepositTransaction.amount)).toBe(true);
        }
        if (collateralDepositTransaction.status)
          expect(Object.values(CollateralDepositTransactionStatus)).toContain(
            collateralDepositTransaction.status
          );
      }
    });

    it('request should fail with Not Found', async () => {
      const error = await getCollateralDepositTransactionsFailureResult('1');

      expect(error.status).toBe(404);
      expect(error.body.errorType).toBe(GeneralError.errorType.NOT_FOUND);
      expect(error.body.requestPart).toBe(undefined);
    });
  });

  describe('get collateral deposit transaction details', () => {
    const getCollateralDepositTransactionDetailsFailureResult = async (
      accountId: string
    ): Promise<ApiError> => {
      try {
        await client.collateral.getCollateralDepositTransactionDetails({
          accountId,
          collateralId,
          collateralTxId,
        });
      } catch (err) {
        if (err instanceof ApiError) {
          return err;
        }
        throw err;
      }
      throw new Error('Expected to throw');
    };

    it('get collateral deposit transaction details return with a valid schema', async () => {
      const collateralDepositTransaction =
        await client.collateral.getCollateralDepositTransactionDetails({
          accountId,
          collateralId,
          collateralTxId,
        });

      expect(collateralDepositTransaction.collateralTxId).toEqual(collateralTxId);

      const splittedCollateralTxId = collateralDepositTransaction.collateralTxId.split('.');

      expect(typeof collateralDepositTransaction.collateralTxId).toBe('string');
      expect(splittedCollateralTxId.length).toBe(3);
      expect(splittedCollateralTxId[0]).toBe('0');
      expect(splittedCollateralTxId[1]).toBe(accountId);
      expect(isUUIDv4(splittedCollateralTxId[2])).toBe(true);

      expect(typeof collateralDepositTransaction.fireblocksAssetId).toBe('string');
      if (collateralDepositTransaction.amount) {
        expect(typeof collateralDepositTransaction.amount).toBe('string');
        expect(isPositiveAmount(collateralDepositTransaction.amount)).toBe(true);
      }
      if (collateralDepositTransaction.status)
        expect(Object.values(CollateralDepositTransactionStatus)).toContain(
          collateralDepositTransaction.status
        );
    });

    it('request should fail with Not Found', async () => {
      const error = await getCollateralDepositTransactionDetailsFailureResult('1');

      expect(error.status).toBe(404);
      expect(error.body.errorType).toBe(GeneralError.errorType.NOT_FOUND);
      expect(error.body.requestPart).toBe(undefined);
    });
  });
});
