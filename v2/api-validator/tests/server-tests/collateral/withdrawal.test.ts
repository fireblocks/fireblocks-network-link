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
  PublicBlockchainCapability,
  CryptocurrencySymbol,
  Blockchain,
  CryptocurrencyReference,
  NativeCryptocurrency,
  OtherAssetReference,
  NationalCurrency,
  PublicBlockchainAddress,
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
    return 'cryptocurrencySymbol' in asset;
  }

  function isOtherAssetReference(
    asset: NativeCryptocurrency | OtherAssetReference | NationalCurrency
  ): asset is OtherAssetReference {
    return 'assetId' in asset;
  }

  beforeAll(async () => {
    accountId = getCapableAccountId('collateral');
  });

  describe('Create collateral withdrawal transaction (remove collateral) & fetch by collateralTxId ', () => {
    const address: string = config.get('collateral.withdrawal.address');
    const addressTag: string | undefined = config.get('collateral.withdrawal.addressTag');
    const transferMethod: PublicBlockchainCapability.transferMethod = config.get(
      'collateral.withdrawal.transferMethod.blockchain'
    );
    const assetId: string = config.get('collateral.asset.assetId');
    const symbol: CryptocurrencySymbol = config.get('collateral.asset.symbol');
    const blockchain: Blockchain = config.get('collateral.asset.blockchain');
    const testAsset: boolean = config.get('collateral.asset.testAsset');
    describe('test each address', () => {
      let partnerIntentId: string;
      it('Initiate request should return with a valid response', async () => {
        const asset: CryptocurrencyReference = assetId
          ? {
              assetId: assetId,
            }
          : {
              blockchain: blockchain,
              cryptocurrencySymbol: symbol,
              testAsset: testAsset,
            };
        const destinationAddress: PublicBlockchainAddress = {
          address: address,
          addressTag: addressTag,
          asset: asset,
          transferMethod: transferMethod,
        };
        const requestBody: CollateralWithdrawalTransactionIntentRequest = {
          amount: '5',
          destinationAddress: destinationAddress,
          intentApprovalRequest: intentApprovalRequest,
        };

        const withdrawlCapability = await client.capabilities.getWithdrawalMethods({ accountId });

        const capabilityAsset =
          withdrawlCapability.capabilities.find(
            (capability) =>
              isNativeCryptocurrency(capability.withdrawal.asset) &&
              isNativeCryptocurrency(destinationAddress.asset) &&
              capability.withdrawal.asset.cryptocurrencySymbol ===
                destinationAddress.asset.cryptocurrencySymbol
          ) ||
          withdrawlCapability.capabilities.find(
            (capability) =>
              isOtherAssetReference(capability.withdrawal.asset) &&
              isOtherAssetReference(destinationAddress.asset) &&
              capability.withdrawal.asset.assetId === destinationAddress.asset.assetId
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
