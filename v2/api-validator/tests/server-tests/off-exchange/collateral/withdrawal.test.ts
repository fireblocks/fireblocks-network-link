import {
  CollateralWithdrawalTransaction,
  PublicBlockchainCapability,
  Blockchain,
  CollateralWithdrawalTransactionStatus,
  CryptocurrencySymbol,
  CollateralWithdrawalTransactionRequest,
  CollateralWithdrawalTransactions,
} from '../../../../src/client/generated';
import { getCapableAccountId } from '../../../utils/capable-accounts';
import { Pageable, paginated } from '../../../utils/pagination';
import config from '../../../../src/config';
import Client from '../../../../src/client';

type Address = {
  address: string;
  addressTag?: string;
};

describe('Collateral Withdrawal', () => {
  const client: Client = new Client();
  const accountId = getCapableAccountId('collateral');
  const collateralId = config.get('collateral.signers.userId');

  describe('Create collateral withdrawal & fetch by collateralTxId ', () => {
    const address: Address[] = config.get('collateral.withdrawal.addresses');
    describe.each(address)('Status validation', (testParams) => {
      let collateralTxId: string;
      const { address, addressTag } = testParams;
      const requestBody: CollateralWithdrawalTransactionRequest = {
        amount: '50',
        destinationAddress: {
          address: address,
          addressTag: addressTag,
          asset: {
            blockchain: Blockchain.ALGORAND,
            cryptocurrencySymbol: CryptocurrencySymbol.ALGO,
            testAsset: false,
          },
          transferMethod: PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN,
        },
      };
      it('Create request should return with a valid response', async () => {
        const collateralWithdrawalTransaction: CollateralWithdrawalTransaction =
          await client.collateral.initiateCollateralWithdrawalTransaction({
            accountId,
            collateralId,
            requestBody,
          });

        collateralTxId = collateralWithdrawalTransaction.collateralTxId;

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
