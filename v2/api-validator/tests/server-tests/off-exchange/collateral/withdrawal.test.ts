import {
  CollateralWithdrawalTransaction,
  PublicBlockchainCapability,
  Blockchain,
  CollateralWithdrawalTransactionStatus,
  CryptocurrencySymbol,
} from '../../../../src/client/generated';
import { getCapableAccountId } from '../../../utils/capable-accounts';
import { Pageable, paginated } from '../../../utils/pagination';
import config from '../../../../src/config';
import Client from '../../../../src/client';

describe('Collateral Withdrawal', () => {
  const client: Client = new Client();
  const accountId = getCapableAccountId('collateral');
  const collateralId = config.get('collateral.signers.userId');
  const collateralTxId = `0.${accountId}.${accountId}`;

  describe('initiateCollateralWithdrawalTransaction', () => {
    it('should return with a valid response', async () => {
      const collateralWithdrawalTransaction =
        await client.collateral.initiateCollateralWithdrawalTransaction({
          accountId,
          collateralId,
          requestBody: {
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
    it('should return with a valid response', async () => {
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
    it('should return with a valid response', async () => {
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
