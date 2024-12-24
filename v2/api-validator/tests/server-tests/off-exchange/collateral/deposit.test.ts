import {
  CollateralDepositTransactionResponse,
  CollateralDepositTransactionRequest,
  CollateralDepositTransactionsResponse,
  CollateralDepositTransactionStatus,
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

  describe.each([
    { status: CollateralDepositTransactionStatus.REJECTED },
    { amount: '0.002', status: CollateralDepositTransactionStatus.PENDING },
  ])('Register collateral deposit transaction & fetch by collateralTxId', (testParams) => {
    const collateralTxId = `2.${accountId}.${uuid()}`;
    const depositDetails: CollateralDepositTransactionRequest = {
      collateralTxId: collateralTxId,
      amount: testParams.amount,
    };
    it('Register should return valid response', async () => {
      const collateralDepositTransaction: CollateralDepositTransactionResponse =
        await client.collateral.registerCollateralDepositTransaction({
          accountId,
          collateralId,
          requestBody: {
            ...depositDetails,
          },
        });

      expect(collateralDepositTransaction.collateralTxId).toBe(collateralTxId);
      Object.keys(testParams).forEach((key) => {
        expect(collateralDepositTransaction[key]).toBe(testParams[key]);
      });
    });

    it('Get by collateralTxId return valid response', async () => {
      const collateralDepositTransaction: CollateralDepositTransactionResponse =
        await client.collateral.getCollateralDepositTransactionDetails({
          accountId,
          collateralId,
          collateralTxId,
        });

      expect(collateralDepositTransaction.collateralTxId).toEqual(collateralTxId);
      Object.keys(testParams).forEach((key) => {
        expect(collateralDepositTransaction[key]).toBe(testParams[key]);
      });
    });
  });

  describe('Get List of collateral deposit transactions', () => {
    it('Should return valid response', async () => {
      const getCollateralDepositTransactions: Pageable<
        CollateralDepositTransactionResponse
      > = async (limit, startingAfter?) => {
        const response: CollateralDepositTransactionsResponse =
          await client.collateral.getCollateralDepositTransactions({
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
});
