import {
  ApprovalRequest,
  CollateralDepositTransactionIntentRequest,
  CollateralDepositTransactionIntentResponse,
  CollateralDepositTransactionRequest,
  CollateralDepositTransactionResponse,
  CollateralDepositTransactionsResponse,
  CryptocurrencyReference,
  IntentApprovalRequest,
} from '../../../src/client/generated';
import { getCapableAccountId, hasCapability } from '../../utils/capable-accounts';
import { v4 as uuid } from 'uuid';
import { Pageable, paginated } from '../../utils/pagination';
import config from '../../../src/config';
import Client from '../../../src/client';

const noCollateralCapability = !hasCapability('collateral');
const noTransferCapability = !hasCapability('transfers');

describe.skipIf(noCollateralCapability || noTransferCapability)('Collateral Deposit', () => {
  const client: Client = new Client();
  const collateralId: string = config.get('collateral.collateralAccount.accountId');
  const fireblocksIntentId = uuid();
  let assetId: string;
  let accountId: string;

  beforeAll(async () => {
    accountId = getCapableAccountId('collateral');
    const assetsResult = await client.capabilities.getAdditionalAssets({});
    assetId = assetsResult.assets[0]?.id;

    // Validating that deposit capabilities are enabled, as it is a must for collateral deposit operations.
    expect(() => {
      client.capabilities.getDepositMethods({ accountId });
    }).not.toThrow();
  });

  describe('Register collateral deposit transaction (add collateral) & fetch by collateralTxId', () => {
    const collateralTxId = `2.${uuid()}.${collateralId}`;
    const intentApprovalRequest: IntentApprovalRequest = { fireblocksIntentId: fireblocksIntentId };
    let partnerIntentId: string;
    it('Initiate should return valid response', async () => {
      const asset: CryptocurrencyReference = { assetId: assetId };
      const requestBody: CollateralDepositTransactionIntentRequest = {
        asset: asset,
        intentApprovalRequest: intentApprovalRequest,
        amount: '100',
      };
      const initiateDepositTransaction: CollateralDepositTransactionIntentResponse =
        await client.collateral.initiateCollateralDepositTransactionIntent({
          accountId,
          collateralId,
          requestBody,
        });
      partnerIntentId = initiateDepositTransaction.approvalRequest.partnerIntentId;
      expect(initiateDepositTransaction.asset).toEqual(asset);
      expect(initiateDepositTransaction.amount).toBe('100');
      expect(initiateDepositTransaction.approvalRequest?.fireblocksIntentId).toBe(
        fireblocksIntentId
      );
    });

    it('Register should return valid response', async () => {
      const newApprovalRequest: ApprovalRequest = {
        fireblocksIntentId: fireblocksIntentId,
        partnerIntentId: partnerIntentId,
      };
      const requestBody: CollateralDepositTransactionRequest = {
        collateralTxId,
        approvalRequest: newApprovalRequest,
      };
      const createDepositTransaction: CollateralDepositTransactionResponse =
        await client.collateral.registerCollateralDepositTransaction({
          accountId,
          collateralId,
          requestBody,
        });

      expect(createDepositTransaction.approvalRequest).toEqual(newApprovalRequest);
      expect(createDepositTransaction.collateralTxId).toBe(collateralTxId);
    });

    it('Get by collateralTxId return valid response', async () => {
      const collateralDepositTransaction: CollateralDepositTransactionResponse =
        await client.collateral.getCollateralDepositTransactionDetails({
          accountId,
          collateralId,
          collateralTxId,
        });

      expect(collateralDepositTransaction.approvalRequest.partnerIntentId).toBe(partnerIntentId);
      expect(collateralDepositTransaction.approvalRequest.fireblocksIntentId).toBe(
        fireblocksIntentId
      );
      expect(collateralDepositTransaction.collateralTxId).toBe(collateralTxId);
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
