import {
  ApprovalRequest,
  CollateralDepositTransactionIntentRequest,
  CollateralDepositTransactionIntentResponse,
  CollateralDepositTransactionRequest,
  CollateralDepositTransactionResponse,
  CollateralDepositTransactionsResponse,
  CryptocurrencyReference,
  IntentApprovalRequest,
  NativeCryptocurrency,
  OtherAssetReference,
  NationalCurrency,
  CryptocurrencySymbol,
  Blockchain,
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

  describe('Register collateral deposit transaction (add collateral) & fetch by collateralTxId', () => {
    const assetId: string = config.get('collateral.asset.assetId');
    const symbol: CryptocurrencySymbol = config.get('collateral.asset.symbol');
    const blockchain: Blockchain = config.get('collateral.asset.blockchain');
    const testAsset: boolean = config.get('collateral.asset.testAsset');
    const collateralTxId = `2.${uuid()}.${collateralId}`;
    const intentApprovalRequest: IntentApprovalRequest = { fireblocksIntentId: fireblocksIntentId };
    let partnerIntentId: string;
    it('Initiate should return valid response', async () => {
      const asset: CryptocurrencyReference = assetId
        ? {
            assetId: assetId,
          }
        : {
            blockchain: blockchain,
            cryptocurrencySymbol: symbol,
            testAsset: testAsset,
          };
      const requestBody: CollateralDepositTransactionIntentRequest = {
        asset: asset,
        intentApprovalRequest: intentApprovalRequest,
        amount: '100',
      };

      const depositCapability = await client.capabilities.getDepositMethods({ accountId });

      const capabilityAsset =
        depositCapability.capabilities.find(
          (capability) =>
            isNativeCryptocurrency(capability.deposit.asset) &&
            isNativeCryptocurrency(asset) &&
            capability.deposit.asset.cryptocurrencySymbol === asset.cryptocurrencySymbol
        ) ||
        depositCapability.capabilities.find(
          (capability) =>
            isOtherAssetReference(capability.deposit.asset) &&
            isOtherAssetReference(asset) &&
            capability.deposit.asset.assetId === asset.assetId
        );

      expect(capabilityAsset).toBeDefined();

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
