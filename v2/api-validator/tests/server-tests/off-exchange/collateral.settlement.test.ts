import Client from '../../../src/client';
import { getCapableAccountId, hasCapability } from '../../utils/capable-accounts';
import {
  ApiError,
  GeneralError,
  PublicBlockchainCapability,
  Blockchain,
  CryptocurrencySymbol,
  SettlementRequest,
  SettlementTransactionStatus,
} from '../../../src/client/generated';
import { randomUUID } from 'crypto';

const noCollateralapability = !hasCapability('collateral');

function isPositiveAmount(amount: string): boolean {
  const uuidv4Regex = /^\d+(\.\d+)?/i;
  return uuidv4Regex.test(amount);
}

describe.skipIf(noCollateralapability)('collateral', () => {
  let client: Client;
  let accountId: string;
  let collateralId: string;
  let settlementVersion: string;
  let settlementlDetails: SettlementRequest;

  beforeAll(async () => {
    client = new Client();
    accountId = getCapableAccountId('collateral');
    collateralId = `${randomUUID()}.${accountId}.${randomUUID()}`;
    settlementVersion = accountId;
    settlementlDetails = {
      settlementId: randomUUID(),
      settlementVersion: settlementVersion,
    };
  });

  describe('initiate settlement', () => {
    const initiateSettlementFailureResult = async (
      acc: string,
      requestBody: SettlementRequest
    ): Promise<ApiError> => {
      try {
        await client.collateral.initiateSettlement({
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

    it('initiate settlement request should return with a valid schema', async () => {
      const collateralSettlement = await client.collateral.initiateSettlement({
        accountId,
        collateralId,
        requestBody: {
          ...settlementlDetails,
        },
      });
      if (collateralSettlement.settlementVersion !== undefined) {
        expect(typeof collateralSettlement.settlementVersion).toBe('string');
      }

      expect(collateralSettlement.withdrawInstructions).toBeArray();
      expect(collateralSettlement.depositInstructions).toBeArray();

      for (const instruction of collateralSettlement.withdrawInstructions) {
        expect(typeof instruction.fireblocksAssetId).toBe('string');
        expect(isPositiveAmount(instruction.amount)).toBe(true);
        if (instruction.fee !== undefined) {
          expect(isPositiveAmount(instruction.fee)).toBe(true);
        }
        expect(typeof instruction.sourceAddress.address).toBe('string');
        if (instruction.sourceAddress.addressTag !== undefined)
          expect(typeof instruction.sourceAddress.addressTag).toBe('string');
        expect(Object.values(PublicBlockchainCapability.transferMethod)).toContain(
          instruction.sourceAddress.transferMethod
        );
        if (instruction.sourceAddress.asset['assetId'] === undefined) {
          expect(Object.values(Blockchain)).toContain(
            instruction.sourceAddress.asset['blockchain']
          );
          expect(Object.values(CryptocurrencySymbol)).toContain(
            instruction.sourceAddress.asset['cryptocurrencySymbol']
          );
          expect(typeof instruction.sourceAddress.asset['testAsset']).toBe('boolean');
        } else {
          expect(typeof instruction.sourceAddress.asset['assetId']).toBe('string');
        }
      }

      for (const instruction of collateralSettlement.depositInstructions) {
        expect(typeof instruction.fireblocksAssetId).toBe('string');
        expect(isPositiveAmount(instruction.amount)).toBe(true);
        expect(typeof instruction.destinationAddress.address).toBe('string');
        if (instruction.destinationAddress.addressTag !== undefined)
          expect(typeof instruction.destinationAddress.addressTag).toBe('string');
        expect(Object.values(PublicBlockchainCapability.transferMethod)).toContain(
          instruction.destinationAddress.transferMethod
        );
        if (instruction.destinationAddress.asset['assetId'] === undefined) {
          expect(Object.values(Blockchain)).toContain(
            instruction.destinationAddress.asset['blockchain']
          );
          expect(Object.values(CryptocurrencySymbol)).toContain(
            instruction.destinationAddress.asset['cryptocurrencySymbol']
          );
          expect(typeof instruction.destinationAddress.asset['testAsset']).toBe('boolean');
        } else {
          expect(typeof instruction.destinationAddress.asset['assetId']).toBe('string');
        }
      }
    });

    it('initiate settlement instructions request should fail with Not Found', async () => {
      const reqBody = settlementlDetails;
      const error = await initiateSettlementFailureResult('1', reqBody);

      expect(error.status).toBe(404);
      expect(error.body.errorType).toBe(GeneralError.errorType.NOT_FOUND);
      expect(error.body.requestPart).toBe(undefined);
    });
  });

  describe('get current settlement instructions', () => {
    const getCurrentSettlementInstructionsFailureResult = async (
      accId: string
    ): Promise<ApiError> => {
      try {
        await client.collateral.getCurrentSettlementInstructions({
          accountId: accId,
          collateralId,
        });
      } catch (err) {
        if (err instanceof ApiError) {
          return err;
        }
        throw err;
      }
      throw new Error('Expected to throw');
    };

    it('get current settlement instructions should return with a valid schema', async () => {
      const collateralSettlement = await client.collateral.getCurrentSettlementInstructions({
        accountId,
        collateralId,
      });

      if (collateralSettlement.settlementVersion !== undefined) {
        expect(typeof collateralSettlement.settlementVersion).toBe('string');
      }

      expect(collateralSettlement.withdrawInstructions).toBeArray();
      expect(collateralSettlement.depositInstructions).toBeArray();

      for (const instruction of collateralSettlement.withdrawInstructions) {
        expect(typeof instruction.fireblocksAssetId).toBe('string');
        expect(isPositiveAmount(instruction.amount)).toBe(true);
        if (instruction.fee !== undefined) {
          expect(isPositiveAmount(instruction.fee)).toBe(true);
        }
        expect(typeof instruction.sourceAddress.address).toBe('string');
        if (instruction.sourceAddress.addressTag !== undefined)
          expect(typeof instruction.sourceAddress.addressTag).toBe('string');
        expect(Object.values(PublicBlockchainCapability.transferMethod)).toContain(
          instruction.sourceAddress.transferMethod
        );
        if (instruction.sourceAddress.asset['assetId'] === undefined) {
          expect(Object.values(Blockchain)).toContain(
            instruction.sourceAddress.asset['blockchain']
          );
          expect(Object.values(CryptocurrencySymbol)).toContain(
            instruction.sourceAddress.asset['cryptocurrencySymbol']
          );
          expect(typeof instruction.sourceAddress.asset['testAsset']).toBe('boolean');
        } else {
          expect(typeof instruction.sourceAddress.asset['assetId']).toBe('string');
        }
      }

      for (const instruction of collateralSettlement.depositInstructions) {
        expect(typeof instruction.fireblocksAssetId).toBe('string');
        expect(isPositiveAmount(instruction.amount)).toBe(true);
        expect(typeof instruction.destinationAddress.address).toBe('string');
        if (instruction.destinationAddress.addressTag !== undefined)
          expect(typeof instruction.destinationAddress.addressTag).toBe('string');
        expect(Object.values(PublicBlockchainCapability.transferMethod)).toContain(
          instruction.destinationAddress.transferMethod
        );
        if (instruction.destinationAddress.asset['assetId'] === undefined) {
          expect(Object.values(Blockchain)).toContain(
            instruction.destinationAddress.asset['blockchain']
          );
          expect(Object.values(CryptocurrencySymbol)).toContain(
            instruction.destinationAddress.asset['cryptocurrencySymbol']
          );
          expect(typeof instruction.destinationAddress.asset['testAsset']).toBe('boolean');
        } else {
          expect(typeof instruction.destinationAddress.asset['assetId']).toBe('string');
        }
      }
    });

    it('request should fail with Not Found', async () => {
      const error = await getCurrentSettlementInstructionsFailureResult('1');

      expect(error.status).toBe(404);
      expect(error.body.errorType).toBe(GeneralError.errorType.NOT_FOUND);
      expect(error.body.requestPart).toBe(undefined);
    });
  });

  describe('get settlement details', () => {
    const getSettlementDetailsFailureResult = async (accId: string): Promise<ApiError> => {
      try {
        await client.collateral.getSettlementDetails({
          accountId: accId,
          collateralId,
          settlementVersion,
        });
      } catch (err) {
        if (err instanceof ApiError) {
          return err;
        }
        throw err;
      }
      throw new Error('Expected to throw');
    };

    it('get settlement details return with a valid schema', async () => {
      const collateralSettlementDetails = await client.collateral.getSettlementDetails({
        accountId,
        collateralId,
        settlementVersion,
      });

      if (collateralSettlementDetails.settlementVersion !== undefined) {
        expect(typeof collateralSettlementDetails.settlementVersion).toBe('string');
      }

      if (collateralSettlementDetails.status !== undefined) {
        expect(typeof collateralSettlementDetails.status).toBe('string');
      }

      expect(collateralSettlementDetails.withdrawTransactions).toBeArray();
      expect(collateralSettlementDetails.depositTransactions).toBeArray();
      if (collateralSettlementDetails.withdrawTransactions !== undefined) {
        for (const transaction of collateralSettlementDetails.withdrawTransactions) {
          expect(typeof transaction.fireblocksAssetId).toBe('string');
          expect(isPositiveAmount(transaction.amount)).toBe(true);
          if (transaction.fee !== undefined) {
            expect(isPositiveAmount(transaction.fee)).toBe(true);
          }
          expect(Object.values(SettlementTransactionStatus)).toContain(transaction.status);
          if (transaction.status === SettlementTransactionStatus.REJECTED) {
            expect(typeof transaction.rejectionReason).toBe('string');
          }
          expect(typeof transaction.sourceAddress.address).toBe('string');
          if (transaction.sourceAddress.addressTag !== undefined)
            expect(typeof transaction.sourceAddress.addressTag).toBe('string');
          expect(Object.values(PublicBlockchainCapability.transferMethod)).toContain(
            transaction.sourceAddress.transferMethod
          );
          if (transaction.sourceAddress.asset['assetId'] === undefined) {
            expect(Object.values(Blockchain)).toContain(
              transaction.sourceAddress.asset['blockchain']
            );
            expect(Object.values(CryptocurrencySymbol)).toContain(
              transaction.sourceAddress.asset['cryptocurrencySymbol']
            );
            expect(typeof transaction.sourceAddress.asset['testAsset']).toBe('boolean');
          } else {
            expect(typeof transaction.sourceAddress.asset['assetId']).toBe('string');
          }
        }
      }
      if (collateralSettlementDetails.depositTransactions !== undefined) {
        for (const transaction of collateralSettlementDetails.depositTransactions) {
          expect(typeof transaction.fireblocksAssetId).toBe('string');
          expect(isPositiveAmount(transaction.amount)).toBe(true);
          expect(Object.values(SettlementTransactionStatus)).toContain(transaction.status);
          if (transaction.status === SettlementTransactionStatus.REJECTED) {
            expect(typeof transaction.rejectionReason).toBe('string');
          }
          expect(typeof transaction.destinationAddress.address).toBe('string');
          if (transaction.destinationAddress.addressTag !== undefined)
            expect(typeof transaction.destinationAddress.addressTag).toBe('string');
          expect(Object.values(PublicBlockchainCapability.transferMethod)).toContain(
            transaction.destinationAddress.transferMethod
          );
          if (transaction.destinationAddress.asset['assetId'] === undefined) {
            expect(Object.values(Blockchain)).toContain(
              transaction.destinationAddress.asset['blockchain']
            );
            expect(Object.values(CryptocurrencySymbol)).toContain(
              transaction.destinationAddress.asset['cryptocurrencySymbol']
            );
            expect(typeof transaction.destinationAddress.asset['testAsset']).toBe('boolean');
          } else {
            expect(typeof transaction.destinationAddress.asset['assetId']).toBe('string');
          }
        }
      }
    });

    it('request should fail with Not Found', async () => {
      const error = await getSettlementDetailsFailureResult('1');

      expect(error.status).toBe(404);
      expect(error.body.errorType).toBe(GeneralError.errorType.NOT_FOUND);
      expect(error.body.requestPart).toBe(undefined);
    });
  });
});
