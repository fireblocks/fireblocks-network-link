import Client from '../../../src/client';
import { getCapableAccountId, hasCapability } from '../../utils/capable-accounts';
import { Pageable, paginated } from '../../utils/pagination';
import {
  ApiError,
  BadRequestError,
  RequestPart,
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
      collateralTxId: collateralTxId,
      fireblocksAssetId: fireblocksAssetId,
      amount: '0.002',
      status: CollateralDepositTransactionStatus.PENDING
    };
  });

  describe('create collateral deposit address for asset', () => {
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
      
      const CollateralDepositTransaction = await client.collateral.registerCollateralDepositTransaction({
        accountId,
        collateralId,
        requestBody: {
          ...depositDetails,
        },
      });

      
      const splittedCollateralTxId = CollateralDepositTransaction.collateralTxId.split('.');
      
      expect(typeof CollateralDepositTransaction.collateralTxId).toBe('string');
      expect(splittedCollateralTxId.length).toBe(3);
      expect(splittedCollateralTxId[0]).toBe('0');
      expect(splittedCollateralTxId[1]).toBe(accountId);
      expect(isUUIDv4(splittedCollateralTxId[2])).toBe(true);

      expect(typeof CollateralDepositTransaction.fireblocksAssetId).toBe('string');

      expect(typeof CollateralDepositTransaction.amount).toBe('string');
      // @ts-ignore
      expect(isPositiveAmount(CollateralDepositTransaction.amount)).toBe(true);
      expect(Object.values(CollateralDepositTransactionStatus)).toContain(CollateralDepositTransaction.status);

    });

    it('register collateral deposit transaction reques with amount undefined should return with a valid schema', async () => {
      const newDetails = {...depositDetails};
      delete newDetails.amount;
      
      const CollateralDepositTransaction = await client.collateral.registerCollateralDepositTransaction({
        accountId,
        collateralId,
        requestBody: {
          ...newDetails,
        },
      });

      const splittedCollateralTxId = CollateralDepositTransaction.collateralTxId.split('.');
      
      expect(typeof CollateralDepositTransaction.collateralTxId).toBe('string');
      expect(splittedCollateralTxId.length).toBe(3);
      expect(splittedCollateralTxId[0]).toBe('0');
      expect(splittedCollateralTxId[1]).toBe(accountId);
      expect(isUUIDv4(splittedCollateralTxId[2])).toBe(true);

      expect(typeof CollateralDepositTransaction.fireblocksAssetId).toBe('string');

      expect(CollateralDepositTransaction.amount).toBe(undefined);
      expect(Object.values(CollateralDepositTransactionStatus)).toContain(CollateralDepositTransaction.status);

    });

    it('register collateral deposit transaction request with status undefined should return with a valid schema', async () => {
      delete depositDetails.status;
      const CollateralDepositTransaction = await client.collateral.registerCollateralDepositTransaction({
        accountId,
        collateralId,
        requestBody: {
          ...depositDetails,
        },
      });
      
      const splittedCollateralTxId = CollateralDepositTransaction.collateralTxId.split('.');
      
      expect(typeof CollateralDepositTransaction.collateralTxId).toBe('string');
      expect(splittedCollateralTxId.length).toBe(3);
      expect(splittedCollateralTxId[0]).toBe('0');
      expect(splittedCollateralTxId[1]).toBe(accountId);
      expect(isUUIDv4(splittedCollateralTxId[2])).toBe(true);

      expect(typeof CollateralDepositTransaction.fireblocksAssetId).toBe('string');

      expect(typeof CollateralDepositTransaction.amount).toBe('string');
      // @ts-ignore
      expect(isPositiveAmount(CollateralDepositTransaction.amount)).toBe(true);
      expect(CollateralDepositTransaction.status).toBe(undefined);

    });

    it('register collateral deposit transaction request with status and amount undefined should return with a valid schema', async () => {
      delete depositDetails.amount;
      const CollateralDepositTransaction = await client.collateral.registerCollateralDepositTransaction({
        accountId,
        collateralId,
        requestBody: {
          ...depositDetails,
        },
      });
      
      const splittedCollateralTxId = CollateralDepositTransaction.collateralTxId.split('.');
      
      expect(typeof CollateralDepositTransaction.collateralTxId).toBe('string');
      expect(splittedCollateralTxId.length).toBe(3);
      expect(splittedCollateralTxId[0]).toBe('0');
      expect(splittedCollateralTxId[1]).toBe(accountId);
      expect(isUUIDv4(splittedCollateralTxId[2])).toBe(true);
      expect(typeof CollateralDepositTransaction.fireblocksAssetId).toBe('string');
      
      expect(CollateralDepositTransaction.amount).toBe(undefined);
      expect(CollateralDepositTransaction.status).toBe(undefined);
    });

    it('register collateral deposit transaction request should fail with Not Found', async () => {
      const reqBody: CollateralDepositTransaction = depositDetails;
      const error = await registerCollateralDepositTransactionFailureResult('1', reqBody);

      expect(error.status).toBe(404);
      expect(error.body.errorType).toBe(GeneralError.errorType.NOT_FOUND);
      expect(error.body.requestPart).toBe(undefined);
    });

    it('register collateral deposit transaction request should fail schema property', async () => {
      const reqBody: CollateralDepositTransaction = depositDetails;
      reqBody.amount = '-2'
      const error = await registerCollateralDepositTransactionFailureResult('1', reqBody);

      expect(error.status).toBe(400);
      expect(error.body.errorType).toBe(BadRequestError.errorType.SCHEMA_PROPERTY_ERROR);
      expect(error.body.requestPart).toBe(RequestPart.BODY);
    });
  });
});
