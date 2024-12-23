import {
  CollateralWithdrawalTransaction,
  PublicBlockchainCapability,
  Blockchain,
  CollateralWithdrawalTransactionStatus,
  CryptocurrencySymbol,
  CollateralWithdrawalTransactionRequest,
} from '../../../../src/client/generated';
import { getCapableAccountId } from '../../../utils/capable-accounts';
import { Pageable, paginated } from '../../../utils/pagination';
import config from '../../../../src/config';
import Client from '../../../../src/client';

describe('Collateral Withdrawal', () => {
  const client: Client = new Client();
  const accountId = getCapableAccountId('collateral');
  const collateralId = config.get('collateral.signers.userId');

  describe('Create collateral withdrawal & fetch by collateralTxId ', () => {
    const validAddress = config.get('collateral.withdrawal.validAddress');
    const validTag = config.get('collateral.withdrawal.validTag');
    const inValidAddress = config.get('collateral.withdrawal.inValidAddress');
    describe.each([
      {
        address: validAddress,
        addressTag: validTag,
        expectedStatus: CollateralWithdrawalTransactionStatus.APPROVED,
        expectedRejectionReason: false,
      },
      {
        address: inValidAddress,
        addressTag: '',
        expectedStatus: CollateralWithdrawalTransactionStatus.REJECTED,
        expectedRejectionReason: true,
      },
    ])('Status validation', (testParams) => {
      let collateralTxId: string;
      const { address, addressTag, expectedStatus, expectedRejectionReason } = testParams;
      const requestBody: CollateralWithdrawalTransactionRequest = {
        amount: '0.002',
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
        const collateralWithdrawalTransaction =
          await client.collateral.initiateCollateralWithdrawalTransaction({
            accountId,
            collateralId,
            requestBody,
          });

        collateralTxId = collateralWithdrawalTransaction.collateralTxId;

        expect(collateralWithdrawalTransaction.status).toBe(expectedStatus);
        if (expectedRejectionReason) {
          expect(collateralWithdrawalTransaction).toHaveProperty('rejectionReason');
        }
      });

      it('Get request should return with a valid response', async () => {
        const collateralWithdrawalTransaction =
          await client.collateral.getCollateralWithdrawalTransactionDetails({
            accountId,
            collateralId,
            collateralTxId,
          });

        expect(collateralWithdrawalTransaction.collateralTxId).toBe(collateralTxId);
        expect(collateralWithdrawalTransaction.status).toBe(expectedStatus);
        if (expectedRejectionReason) {
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
});
