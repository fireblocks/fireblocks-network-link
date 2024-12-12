import {
  CollateralWithdrawalTransaction,
  PublicBlockchainCapability,
  Blockchain,
  CollateralWithdrawalTransactionStatus,
  CryptocurrencySymbol,
} from '../../../../src/client/generated';
import { getCapableAccountId } from '../../../utils/capable-accounts';
import { v4 as uuid } from 'uuid';
import { Pageable, paginated } from '../../../utils/pagination';
import Client from '../../../../src/client';

describe('Collateral Withdrawal', () => {
  const client: Client = new Client();
  const accountId = getCapableAccountId('collateral');
  const fireblocksAssetId = uuid();
  const collateralId = `${uuid()}.${accountId}.${uuid()}`;
  const collateralTxId = `0.${accountId}.${accountId}`;

  describe('initiateCollateralWithdrawalTransaction', () => {
    it('Should return with a valid schema', async () => {
      const collateralWithdrawalTransaction =
        await client.collateral.initiateCollateralWithdrawalTransaction({
          accountId,
          collateralId,
          requestBody: {
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
          },
        });

      if (
        collateralWithdrawalTransaction.status === CollateralWithdrawalTransactionStatus.REJECTED
      ) {
        expect(collateralWithdrawalTransaction).toHaveProperty('rejectionReason');
      }
    });
  });

  describe('getCollateralWithdrawalTransactions', () => {
    it('Should return with a valid schema', async () => {
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
        if (
          collateralWithdrawalTransaction.status === CollateralWithdrawalTransactionStatus.REJECTED
        ) {
          expect(collateralWithdrawalTransaction).toHaveProperty('rejectionReason');
        }
      }
    });
  });

  describe('getCollateralWithdrawalTransactionDetails', () => {
    it('Should return with a valid schema', async () => {
      const collateralWithdrawalTransaction =
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
