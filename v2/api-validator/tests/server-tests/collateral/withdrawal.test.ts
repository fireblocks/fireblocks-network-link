import {
  CollateralWithdrawalTransaction,
  CollateralWithdrawalTransactionStatus,
  CollateralWithdrawalTransactionRequest,
  CollateralWithdrawalTransactions,
  PublicBlockchainAddress,
} from '../../../src/client/generated';
import { getCapableAccountId, hasCapability } from '../../utils/capable-accounts';
import { Pageable, paginated } from '../../utils/pagination';
import { v4 as uuid } from 'uuid';
import config from '../../../src/config';
import Client from '../../../src/client';

const noCollateralCapability = !hasCapability('transfers');

describe.skipIf(noCollateralCapability)('Collateral Withdrawal', () => {
  const client: Client = new Client();
  const accountId: string = getCapableAccountId('collateral');
  const collateralId = config.get('collateral.signers.userId');

  describe('Create collateral withdrawal & fetch by collateralTxId ', () => {
    const address: PublicBlockchainAddress[] = JSON.parse(
      config.get('collateral.withdrawal.addresses')
    );
    describe.each(address)('Status validation', (testParams) => {
      const collateralTxId = `0.${accountId}.${uuid()}`;
      const requestBody: CollateralWithdrawalTransactionRequest = {
        collateralTxId,
        amount: '50',
        destinationAddress: testParams,
      };
      it('Create request should return with a valid response', async () => {
        const collateralWithdrawalTransaction: CollateralWithdrawalTransaction =
          await client.collateral.initiateCollateralWithdrawalTransaction({
            accountId,
            collateralId,
            requestBody,
          });

        expect(collateralWithdrawalTransaction.collateralTxId).toBe(collateralTxId);

        if (
          collateralWithdrawalTransaction.status === CollateralWithdrawalTransactionStatus.REJECTED
        ) {
          expect(collateralWithdrawalTransaction).toHaveProperty('rejectionReason');
        }
      });

      it('Get request should return with a valid response', async () => {
        const collateralWithdrawalTransaction: CollateralWithdrawalTransaction =
          await client.collateral.getCollateralWithdrawalTransactionDetails({
            accountId,
            collateralId,
            collateralTxId,
          });

        expect(collateralWithdrawalTransaction.collateralTxId).toBe(collateralTxId);

        if (
          collateralWithdrawalTransaction.status === CollateralWithdrawalTransactionStatus.REJECTED
        ) {
          expect(collateralWithdrawalTransaction).toHaveProperty('rejectionReason');
        }
      });
    });
  });

  describe('Get List of collateral withdrawal transactions', () => {
    it('Should return with a valid response', async () => {
      const getCollateralWithdrawalTransactions: Pageable<CollateralWithdrawalTransaction> = async (
        limit,
        startingAfter?
      ) => {
        const response: CollateralWithdrawalTransactions =
          await client.collateral.getCollateralWithdrawalTransactions({
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
        if (
          collateralWithdrawalTransaction.status === CollateralWithdrawalTransactionStatus.REJECTED
        ) {
          expect(collateralWithdrawalTransaction).toHaveProperty('rejectionReason');
        }
      }
    });
  });
});
