import Client from '../../../../src/client';
import { getCapableAccountId } from '../../../utils/capable-accounts';
import { Pageable, paginated } from '../../../utils/pagination';
import {
  CollateralWithdrawalTransactionRequest,
  CollateralWithdrawalTransaction,
  PublicBlockchainCapability,
  Blockchain,
  CollateralWithdrawalTransactionStatus,
  CryptocurrencySymbol,
} from '../../../../src/client/generated';
import { v4 as uuid } from 'uuid';

describe('Collateral Withdrawal', () => {
  let client: Client;
  let accountId: string;
  let collateralId: string;
  let fireblocksAssetId: string;
  let collateralTxId: string;
  let withdrawalDetails: CollateralWithdrawalTransactionRequest;

  beforeAll(async () => {
    client = new Client();
    accountId = getCapableAccountId('collateral');
    fireblocksAssetId = uuid();
    collateralId = `${uuid()}.${accountId}.${uuid()}`;
    collateralTxId = `0.${accountId}.${accountId}`;
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

  describe('Initiate withdrawal', () => {
    it('Should return with a valid schema', async () => {
      const collateralWithdrawalTransaction =
        await client.collateral.initiateCollateralWithdrawalTransaction({
          accountId,
          collateralId,
          requestBody: {
            ...withdrawalDetails,
          },
        });

      if (
        collateralWithdrawalTransaction.status === CollateralWithdrawalTransactionStatus.REJECTED
      ) {
        expect(collateralWithdrawalTransaction).toHaveProperty('rejectionReason');
      }
    });
  });

  describe('get collateral withdrawal transactions', () => {
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

  describe('get collateral withdrawal transaction details', () => {
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
