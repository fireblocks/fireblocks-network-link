import Client from '../../../src/client';
import { getCapableAccountId, hasCapability } from '../../utils/capable-accounts';
import { Pageable, paginated } from '../../utils/pagination';
import {
  ApiError,
  GeneralError,
  CollateralWithdrawalTransactionRequest,
  CollateralWithdrawalTransaction,
  PublicBlockchainCapability,
  Blockchain,
  CollateralWithdrawalTransactionStatus,
  CryptocurrencySymbol,
} from '../../../src/client/generated';
import { randomUUID } from 'crypto';

const noCollateralapability = !hasCapability('collateral');

function isUUIDv4(uuid: string): boolean {
  const uuidv4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidv4Regex.test(uuid);
}

describe.skipIf(noCollateralapability)('collateral', () => {
  let client: Client;
  let accountId: string;
  let collateralId: string;
  let fireblocksAssetId: string;
  let collateralTxId: string;
  let withdrawalDetails: CollateralWithdrawalTransactionRequest;

  beforeAll(async () => {
    client = new Client();
    accountId = getCapableAccountId('collateral');
    fireblocksAssetId = randomUUID();
    collateralId = `${randomUUID()}.${accountId}.${randomUUID()}`;
    collateralTxId = `1.${accountId}.${accountId}`;
    withdrawalDetails = {
      fireblocksAssetId: fireblocksAssetId,
      amount: '0.002',
      destinationAddress: {
        address: '0x',
        addressTag: 'abc',
        asset: {
          blockchain: Blockchain.ETHEREUM,
          cryptocurrencySymbol: CryptocurrencySymbol.ETH,
          testAsset: true,
        },
        transferMethod: PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN,
      },
    };
  });

  describe('create collateral deposit transaction', () => {
    const initiateCollateralWithdrawalTransactionFailureResult = async (
      accountId: string,
      requestBody: CollateralWithdrawalTransactionRequest
    ): Promise<ApiError> => {
      try {
        await client.collateral.initiateCollateralWithdrawalTransaction({
          accountId,
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
      const collateralWithdrawalTransaction =
        await client.collateral.initiateCollateralWithdrawalTransaction({
          accountId,
          collateralId,
          requestBody: {
            ...withdrawalDetails,
          },
        });

      const splittedCollateralTxId = collateralWithdrawalTransaction.collateralTxId.split('.');

      expect(typeof collateralWithdrawalTransaction.collateralTxId).toBe('string');
      expect(splittedCollateralTxId.length).toBe(3);
      expect(splittedCollateralTxId[0]).toBe('1');
      expect(splittedCollateralTxId[1]).toBe(accountId);
      expect(isUUIDv4(splittedCollateralTxId[2])).toBe(true);
      expect(typeof collateralWithdrawalTransaction.withdrawalTxBlockchainId).toBe('string');
      expect(Object.values(CollateralWithdrawalTransactionStatus)).toContain(
        collateralWithdrawalTransaction.status
      );
      if (
        collateralWithdrawalTransaction.status === CollateralWithdrawalTransactionStatus.REJECTED
      ) {
        expect(typeof collateralWithdrawalTransaction.rejectionReason).toBe('string');
      }
    });

    it('register collateral deposit transaction request should fail with Not Found', async () => {
      const reqBody = withdrawalDetails;
      const error = await initiateCollateralWithdrawalTransactionFailureResult('1', reqBody);

      expect(error.status).toBe(404);
      expect(error.body.errorType).toBe(GeneralError.errorType.NOT_FOUND);
      expect(error.body.requestPart).toBe(undefined);
    });
  });

  describe('get collateral deposit transactions', () => {
    const getCollateralWithdrawalTransactionsFailureResult = async (
      accountId: string,
      limit?,
      startingAfter?
    ): Promise<ApiError> => {
      try {
        await client.collateral.getCollateralWithdrawalTransactions({
          accountId,
          collateralId,
          limit,
          startingAfter,
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
      const getCollateralWithdrawalTransactions: Pageable<CollateralWithdrawalTransaction> = async (
        limit,
        startingAfter?
      ) => {
        const response = await client.collateral.getCollateralWithdrawalTransactions({
          accountId,
          collateralId,
          limit,
          startingAfter,
        });
        return response.transactions;
      };

      for await (const collateralWithdrawalTransaction of paginated(
        getCollateralWithdrawalTransactions
      )) {
        const splittedCollateralTxId = collateralWithdrawalTransaction.collateralTxId.split('.');

        expect(typeof collateralWithdrawalTransaction.collateralTxId).toBe('string');
        expect(splittedCollateralTxId.length).toBe(3);
        expect(splittedCollateralTxId[0]).toBe('1');
        expect(splittedCollateralTxId[1]).toBe(accountId);
        expect(isUUIDv4(splittedCollateralTxId[2])).toBe(true);
        expect(typeof collateralWithdrawalTransaction.withdrawalTxBlockchainId).toBe('string');
        expect(Object.values(CollateralWithdrawalTransactionStatus)).toContain(
          collateralWithdrawalTransaction.status
        );
        if (
          collateralWithdrawalTransaction.status === CollateralWithdrawalTransactionStatus.REJECTED
        ) {
          expect(typeof collateralWithdrawalTransaction.rejectionReason).toBe('string');
        }
      }
    });

    it('request should fail with Not Found', async () => {
      const error = await getCollateralWithdrawalTransactionsFailureResult('1');

      expect(error.status).toBe(404);
      expect(error.body.errorType).toBe(GeneralError.errorType.NOT_FOUND);
      expect(error.body.requestPart).toBe(undefined);
    });
  });

  describe('get collateral deposit transaction details', () => {
    const getCollateralWiothdrawalTransactionDetailsFailureResult = async (
      accountId: string,
    ): Promise<ApiError> => {
      try {
        await client.collateral.getCollateralWithdrawalTransactionDetails({
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
      const collateralWithdrawalTransaction =
        await client.collateral.getCollateralWithdrawalTransactionDetails({
          accountId,
          collateralId,
          collateralTxId,
        });

      const splittedCollateralTxId = collateralWithdrawalTransaction.collateralTxId.split('.');

      expect(typeof collateralWithdrawalTransaction.collateralTxId).toBe('string');
      expect(splittedCollateralTxId.length).toBe(3);
      expect(splittedCollateralTxId[0]).toBe('1');
      expect(splittedCollateralTxId[1]).toBe(accountId);
      expect(isUUIDv4(splittedCollateralTxId[2])).toBe(true);
      expect(typeof collateralWithdrawalTransaction.withdrawalTxBlockchainId).toBe('string');
      expect(Object.values(CollateralWithdrawalTransactionStatus)).toContain(
        collateralWithdrawalTransaction.status
      );
      if (
        collateralWithdrawalTransaction.status === CollateralWithdrawalTransactionStatus.REJECTED
      ) {
        expect(typeof collateralWithdrawalTransaction.rejectionReason).toBe('string');
      }
    });

    it('request should fail with Not Found', async () => {
      const error = await getCollateralWiothdrawalTransactionDetailsFailureResult('1');

      expect(error.status).toBe(404);
      expect(error.body.errorType).toBe(GeneralError.errorType.NOT_FOUND);
      expect(error.body.requestPart).toBe(undefined);
    });
  });
});
