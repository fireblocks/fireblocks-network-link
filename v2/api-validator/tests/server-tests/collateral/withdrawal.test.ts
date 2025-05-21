import {
  ApprovalRequest,
  CollateralTransactionIntentStatus,
  CollateralWithdrawalTransaction,
  CollateralWithdrawalTransactionIntentRequest,
  CollateralWithdrawalTransactionIntentResponse,
  CollateralWithdrawalTransactionRequest,
  CollateralWithdrawalTransactions,
  CollateralWithdrawalTransactionStatus,
  IntentApprovalRequest,
  PublicBlockchainAddress,
  NativeCryptocurrency,
  OtherAssetReference,
  NationalCurrency,
} from '../../../src/client/generated';
import { getCapableAccountId, hasCapability } from '../../utils/capable-accounts';
import { Pageable, paginated } from '../../utils/pagination';
import config from '../../../src/config';
import Client from '../../../src/client';
import { v4 as uuid } from 'uuid';

const noCollateralCapability = !hasCapability('collateral');
const noTransferCapability = !hasCapability('transfers');

describe.skipIf(noCollateralCapability || noTransferCapability)('Collateral Withdrawal', () => {
  const client: Client = new Client();
  const collateralId = config.get('collateral.collateralAccount.accountId');
  const collateralTxId = `0.${uuid()}.${collateralId}`;
  const fireblocksIntentId = uuid();
  const intentApprovalRequest: IntentApprovalRequest = { fireblocksIntentId: fireblocksIntentId };
  let accountId: string;

  function isNativeCryptocurrency(
    asset: NativeCryptocurrency | OtherAssetReference | NationalCurrency
  ): asset is NativeCryptocurrency {
    return typeof asset === 'object' && 'cryptocurrencySymbol' in asset && 'blockchain' in asset;
  }

  function isOtherAssetReference(
    asset: NativeCryptocurrency | OtherAssetReference | NationalCurrency
  ): asset is OtherAssetReference {
    return typeof asset === 'object' && 'assetId' in asset;
  }

  beforeAll(async () => {
    accountId = getCapableAccountId('collateral');
  });

  describe('Create collateral withdrawal transaction (remove collateral) & fetch by collateralTxId ', () => {
    const withdrawals: PublicBlockchainAddress[] = JSON.parse(
      config.get('collateral.withdrawal.addresses')
    );
    describe.each(withdrawals)('test each address', (testParams) => {
      let partnerIntentId: string;
      it('Initiate request should return with a valid response', async () => {
        const requestBody: CollateralWithdrawalTransactionIntentRequest = {
          amount: '5',
          destinationAddress: testParams,
          intentApprovalRequest: intentApprovalRequest,
        };

        const withdrawlCapability = await client.capabilities.getWithdrawalMethods({ accountId });

        const capabilityAsset =
          withdrawlCapability.capabilities.find(
            (capability) =>
              isNativeCryptocurrency(capability.withdrawal.asset) &&
              isNativeCryptocurrency(testParams.asset) &&
              capability.withdrawal.asset.cryptocurrencySymbol ===
                testParams.asset.cryptocurrencySymbol &&
              capability.withdrawal.asset.blockchain === testParams.asset.blockchain
          ) ||
          withdrawlCapability.capabilities.find(
            (capability) =>
              isOtherAssetReference(capability.withdrawal.asset) &&
              isOtherAssetReference(testParams.asset) &&
              capability.withdrawal.asset.assetId === testParams.asset.assetId
          );

        expect(capabilityAsset).toBeDefined();

        const initiateWithdrawalTransaction: CollateralWithdrawalTransactionIntentResponse =
          await client.collateral.initiateCollateralWithdrawalTransactionIntent({
            accountId,
            collateralId,
            requestBody,
          });

        partnerIntentId = initiateWithdrawalTransaction.approvalRequest.partnerIntentId;
        expect(initiateWithdrawalTransaction).toHaveProperty('id');
        expect(initiateWithdrawalTransaction.amount).toBe(requestBody.amount);
        expect(initiateWithdrawalTransaction.destinationAddress).toEqual(
          requestBody.destinationAddress
        );

        if (initiateWithdrawalTransaction.status === CollateralTransactionIntentStatus.REJECTED) {
          expect(initiateWithdrawalTransaction).toHaveProperty('rejectionReason');
        }
      });

      it('Create request should return with a valid response', async () => {
        const newApprovalRequest: ApprovalRequest = {
          fireblocksIntentId: fireblocksIntentId,
          partnerIntentId: partnerIntentId,
        };
        const requestBody: CollateralWithdrawalTransactionRequest = {
          collateralTxId: collateralTxId,
          approvalRequest: newApprovalRequest,
        };
        const createWithdrawalTransaction: CollateralWithdrawalTransaction =
          await client.collateral.initiateCollateralWithdrawalTransaction({
            accountId,
            collateralId,
            requestBody,
          });

        expect(createWithdrawalTransaction).toHaveProperty('id');
        expect(createWithdrawalTransaction.approvalRequest).toEqual(newApprovalRequest);
        expect(createWithdrawalTransaction.collateralTxId).toBe(collateralTxId);

        if (createWithdrawalTransaction.status === CollateralWithdrawalTransactionStatus.REJECTED) {
          expect(createWithdrawalTransaction).toHaveProperty('rejectionReason');
        }
      });

      it('Get request should return with a valid response', async () => {
        const createWithdrawalTransaction: CollateralWithdrawalTransaction =
          await client.collateral.getCollateralWithdrawalTransactionDetails({
            accountId,
            collateralId,
            collateralTxId,
          });

        expect(createWithdrawalTransaction).toHaveProperty('id');
        expect(createWithdrawalTransaction.approvalRequest.partnerIntentId).toBe(partnerIntentId);
        expect(createWithdrawalTransaction.approvalRequest.fireblocksIntentId).toBe(
          fireblocksIntentId
        );
        expect(createWithdrawalTransaction.collateralTxId).toBe(collateralTxId);

        if (createWithdrawalTransaction.status === CollateralWithdrawalTransactionStatus.REJECTED) {
          expect(createWithdrawalTransaction).toHaveProperty('rejectionReason');
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
        expect(collateralWithdrawalTransaction).toHaveProperty('id');
        if (
          collateralWithdrawalTransaction.status === CollateralWithdrawalTransactionStatus.REJECTED
        ) {
          expect(collateralWithdrawalTransaction).toHaveProperty('rejectionReason');
        }
      }
    });
  });
});
