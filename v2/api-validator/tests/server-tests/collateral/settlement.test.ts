import { getCapableAccountId, hasCapability } from '../../utils/capable-accounts';
import {
  SettlementDepositInstruction,
  SettlementInstructions,
  SettlementState,
  SettlementWithdrawInstruction,
  NativeCryptocurrency,
  OtherAssetReference,
  NationalCurrency,
} from '../../../src/client/generated';
import { v4 as uuid } from 'uuid';
import config from '../../../src/config';
import Client from '../../../src/client';

const noCollateralCapability = !hasCapability('collateral');
const noTransferCapability = !hasCapability('transfers');

describe.skipIf(noCollateralCapability || noTransferCapability)('Collateral Settlements', () => {
  const client: Client = new Client();
  const collateralId: string = config.get('collateral.collateralAccount.accountId');
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

  describe('Check full settlement flow', () => {
    let settlementVersion: string;
    let depositInstructions: SettlementDepositInstruction[];
    let withdrawInstructions: SettlementWithdrawInstruction[];

    it('Get current settlement should return with a valid response', async () => {
      const collateralSettlement: SettlementInstructions =
        await client.collateral.getCurrentSettlementInstructions({
          accountId,
          collateralId,
        });

      expect(!!collateralSettlement).toBe(true);

      settlementVersion = collateralSettlement.settlementVersion;
      depositInstructions = collateralSettlement.depositInstructions;
      withdrawInstructions = collateralSettlement.withdrawInstructions;
    });

    it('Get by settlementVersion request should return with a valid response', async () => {
      const collateralSettlementDetails: SettlementState =
        await client.collateral.getSettlementDetails({
          accountId,
          collateralId,
          settlementVersion,
        });

      expect(collateralSettlementDetails.settlementVersion).toBe(settlementVersion);
      if (collateralSettlementDetails.depositTransactions) {
        for (const index in collateralSettlementDetails.depositTransactions.entries()) {
          expect(collateralSettlementDetails.depositTransactions[index].destinationAddress).toEqual(
            depositInstructions[index].destinationAddress
          );
          expect(collateralSettlementDetails.depositTransactions[index].amount).toBe(
            depositInstructions[index].amount
          );
        }
      }
      if (collateralSettlementDetails.withdrawTransactions) {
        for (const index in collateralSettlementDetails.withdrawTransactions.entries()) {
          expect(collateralSettlementDetails.withdrawTransactions[index].sourceAddress).toEqual(
            withdrawInstructions[index].sourceAddress
          );
          expect(collateralSettlementDetails.withdrawTransactions[index].amount).toBe(
            withdrawInstructions[index].amount
          );
        }
      }
    });

    it('Initiate request should return valid response', async () => {
      const depositCapability = await client.capabilities.getDepositMethods({ accountId });
      for (const depositInstruction of depositInstructions) {
        const destinationAddress = depositInstruction.destinationAddress;
        const depositAsset =
          depositCapability.capabilities.find(
            (capability) =>
              isNativeCryptocurrency(capability.deposit.asset) &&
              isNativeCryptocurrency(destinationAddress.asset) &&
              capability.deposit.asset.cryptocurrencySymbol ===
                destinationAddress.asset.cryptocurrencySymbol
          ) ||
          depositCapability.capabilities.find(
            (capability) =>
              isOtherAssetReference(capability.deposit.asset) &&
              isOtherAssetReference(destinationAddress.asset) &&
              capability.deposit.asset.assetId === destinationAddress.asset.assetId
          );

        expect(depositAsset).toBeDefined();
      }

      const withdrawCapability = await client.capabilities.getWithdrawalMethods({ accountId });
      for (const withdrawInstruction of withdrawInstructions) {
        const withdrawSourceAddress = withdrawInstruction.sourceAddress;
        const withdrawAsset =
          withdrawCapability.capabilities.find(
            (capability) =>
              isNativeCryptocurrency(capability.withdrawal.asset) &&
              isNativeCryptocurrency(withdrawSourceAddress.asset) &&
              capability.withdrawal.asset.cryptocurrencySymbol ===
                withdrawSourceAddress.asset.cryptocurrencySymbol
          ) ||
          withdrawCapability.capabilities.find(
            (capability) =>
              isOtherAssetReference(capability.withdrawal.asset) &&
              isOtherAssetReference(withdrawSourceAddress.asset) &&
              capability.withdrawal.asset.assetId === withdrawSourceAddress.asset.assetId
          );
        expect(withdrawAsset).toBeDefined();
      }

      const collateralSettlement: SettlementInstructions =
        await client.collateral.initiateSettlement({
          accountId,
          collateralId,
          requestBody: {
            settlementId: uuid(),
            settlementVersion: settlementVersion,
          },
        });

      expect(collateralSettlement.settlementVersion).toBe(settlementVersion);
      expect(collateralSettlement.depositInstructions).toEqual(depositInstructions);
      expect(collateralSettlement.withdrawInstructions).toEqual(withdrawInstructions);
    });
  });
});
