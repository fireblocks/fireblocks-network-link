import { Repository } from '../repository';
import {
  CollateralAccountLink,
  CollateralAccount,
  CollateralLinkStatus,
  AccountEnvironment,
  Blockchain,
  CryptocurrencySymbol,
  NativeCryptocurrency,
  CollateralAssetAddress,
  PublicBlockchainAddress,
  CollateralDepositTransactionStatus,
  CollateralDepositTransactionResponse,
  CollateralWithdrawalTransaction,
  CollateralWithdrawalTransactionStatus,
  CollateralTransactionIntentStatus,
  CollateralDepositTransactionIntentResponse,
  IntentApprovalRequest,
  ApprovalRequest,
  CollateralWithdrawalTransactionIntentResponse,
  SettlementInstructions,
  SettlementState,
  CryptocurrencyReference,
} from '../../../client/generated';
import { v4 as uuid } from 'uuid';
import { XComError } from '../../../error';
import { fakeSchemaObject } from '../../../schemas';

type SettlementInstructionsIdentifier = {
  id: string;
} & SettlementInstructions;

type SettlementStateIdentifier = {
  id: string;
} & SettlementState;

export class NotFound extends XComError {
  constructor(id: string) {
    super(`${id} Not Found`);
  }
}

export class NotValid extends XComError {
  constructor(parameter: string) {
    super(`${parameter} Is Not Valid`);
  }
}

export class CollateralController {
  private readonly accountLinksRepository = new Repository<CollateralAccountLink>();
  private readonly depositAddressesRepository = new Repository<CollateralAssetAddress>();
  private readonly initiateDepositTransactionRepository =
    new Repository<CollateralDepositTransactionIntentResponse>();
  private readonly depositTransactionRepository =
    new Repository<CollateralDepositTransactionResponse>();
  private readonly withdrawalTransactionRepository =
    new Repository<CollateralWithdrawalTransaction>();
  private readonly initiateWithdrawalTransactionRepository =
    new Repository<CollateralWithdrawalTransactionIntentResponse>();
  private readonly settlementRepository = new Repository<SettlementInstructionsIdentifier>();
  private readonly settlementStateRepository = new Repository<SettlementStateIdentifier>();

  constructor() {
    for (let i = 0; i < 20; i++) {
      const accountLink = fakeSchemaObject('CollateralAccountLink') as CollateralAccountLink;
      if (
        ![CollateralLinkStatus.FAILED, CollateralLinkStatus.DISABLED].includes(accountLink.status)
      ) {
        delete accountLink.rejectionReason;
      }

      this.accountLinksRepository.create(accountLink);

      const depositAddress = fakeSchemaObject('CollateralAssetAddress') as CollateralAssetAddress;
      this.depositAddressesRepository.create(depositAddress);

      const settlementInstructions = fakeSchemaObject(
        'SettlementInstructions'
      ) as SettlementInstructionsIdentifier;
      settlementInstructions.id = settlementInstructions.settlementVersion;
      this.settlementRepository.create(settlementInstructions);

      const setllementState = fakeSchemaObject('SettlementState') as SettlementStateIdentifier;
      setllementState.id = settlementInstructions.id;
      setllementState.settlementVersion = settlementInstructions.settlementVersion;
      if (setllementState.depositTransactions) {
        for (const index in settlementInstructions.depositInstructions.entries()) {
          setllementState.depositTransactions[index].destinationAddress =
            settlementInstructions.depositInstructions[index].destinationAddress;
          setllementState.depositTransactions[index].amount =
            settlementInstructions.depositInstructions[index].amount;
        }
      }
      if (setllementState.withdrawTransactions) {
        for (const index in settlementInstructions.withdrawInstructions.entries()) {
          setllementState.withdrawTransactions[index].sourceAddress =
            settlementInstructions.withdrawInstructions[index].sourceAddress;
          setllementState.withdrawTransactions[index].amount =
            settlementInstructions.withdrawInstructions[index].amount;
        }
      }
      this.settlementStateRepository.create(setllementState);
    }
  }

  public generateCollateralAssets(
    numAssets: number,
    env: AccountEnvironment
  ): CryptocurrencyReference[] {
    const assets: CryptocurrencyReference[] = [];

    for (let i = 0; i < numAssets; i++) {
      assets.push(this.createCollateralAsset(env));
    }

    return assets;
  }

  private createCollateralAsset(env: AccountEnvironment): NativeCryptocurrency {
    const isTestAsset: boolean = env === AccountEnvironment.SANDBOX ? true : false;
    return {
      blockchain: Blockchain.BITCOIN,
      cryptocurrencySymbol: CryptocurrencySymbol.BTC,
      testAsset: isTestAsset,
    };
  }

  public createCollateralAccountLink(collateralAccount: CollateralAccount): CollateralAccount {
    const newCollateralAccountLink: CollateralAccountLink = {
      id: uuid(),
      collateralId: collateralAccount.collateralId,
      collateralSigners: collateralAccount.collateralSigners || [],
      eligibleCollateralAssets: this.generateCollateralAssets(2, collateralAccount.env),
      status: CollateralLinkStatus.ELIGIBLE,
      env: collateralAccount.env,
    };

    if (
      collateralAccount.collateralId === 'unknownId' ||
      collateralAccount.collateralSigners[0] === 'unknownId'
    ) {
      newCollateralAccountLink.status = CollateralLinkStatus.FAILED;
      newCollateralAccountLink.rejectionReason = 'unknown collateralId/collateralSigner';
    }

    return newCollateralAccountLink;
  }

  public getCollateralAccountLinks(): CollateralAccountLink[] {
    const collateralLinks = this.accountLinksRepository.list();

    return collateralLinks;
  }

  public getCollateralDepositAddresses(
    cryptocurrencySymbol?: string,
    assetId?: string
  ): CollateralAssetAddress[] {
    let depositAddresses = this.depositAddressesRepository.list();
    if (cryptocurrencySymbol) {
      depositAddresses = depositAddresses.filter(
        (collateraladdress) =>
          collateraladdress.address.asset['cryptocurrencySymbol'] === cryptocurrencySymbol
      );
    }
    if (assetId) {
      depositAddresses = depositAddresses.filter(
        (collateraladdress) => collateraladdress.address.asset['assetId'] === assetId
      );
    }

    if (depositAddresses.length === 0) {
      throw new NotFound(
        `depositAddresses for cryptocurrencySymbol: ${cryptocurrencySymbol} & assetId: ${assetId}`
      );
    }

    return depositAddresses;
  }

  public createCollateralDepositAddressForAsset(
    address: PublicBlockchainAddress,
    recoveryAccountId: string
  ): CollateralAssetAddress {
    const newCollateralDepositAddress: CollateralAssetAddress = {
      id: uuid(),
      address: address,
      recoveryAccountId: recoveryAccountId,
    };

    this.depositAddressesRepository.create(newCollateralDepositAddress);
    return newCollateralDepositAddress;
  }

  public getCollateralDepositAddressesDetails(id: string): CollateralAssetAddress {
    const CollateralAssetAddress = this.depositAddressesRepository.find(id);

    if (!CollateralAssetAddress) {
      throw new NotFound(`depositAddressesDetails of id: ${id} not found`);
    }

    return CollateralAssetAddress;
  }

  public initiateCollateralDepositTransactionIntent(
    amount: string,
    asset: CryptocurrencyReference,
    approvalRequest: IntentApprovalRequest
  ): CollateralDepositTransactionIntentResponse {
    const id: string = uuid();
    const newApprovalRequest: ApprovalRequest = {
      FireblocksIntentId: approvalRequest.FireblocksIntentId,
      PartnerIntentId: id,
    };
    const newCollateralDepositTransaction: CollateralDepositTransactionIntentResponse = {
      id: id,
      amount: amount,
      asset: asset,
      approvalRequest: newApprovalRequest,
      status: CollateralTransactionIntentStatus.APPROVED,
    };

    this.initiateDepositTransactionRepository.create(newCollateralDepositTransaction);
    return newCollateralDepositTransaction;
  }

  public registerCollateralDepositTransaction(
    collateralTxId: string,
    approvalRequest: ApprovalRequest
  ): CollateralDepositTransactionResponse {
    const newCollateralDepositTransaction: CollateralDepositTransactionResponse = {
      id: collateralTxId,
      collateralTxId: collateralTxId,
      approvalRequest: approvalRequest,
      status: CollateralDepositTransactionStatus.PENDING,
    };

    this.depositTransactionRepository.create(newCollateralDepositTransaction);
    return newCollateralDepositTransaction;
  }

  public getCollateralDepositTransactions(): CollateralDepositTransactionResponse[] {
    const collateralDepositTransactions = this.depositTransactionRepository.list();

    return collateralDepositTransactions;
  }

  public getCollateralDepositTransactionDetails(
    collateralTxId: string
  ): CollateralDepositTransactionResponse {
    const collateralDepositTransaction = this.depositTransactionRepository.find(collateralTxId);

    if (!collateralDepositTransaction) {
      throw new NotFound('collateralTxId');
    }

    return collateralDepositTransaction;
  }

  public initiateCollateralWithdrawalTransactionIntent(
    status: CollateralTransactionIntentStatus = CollateralTransactionIntentStatus.APPROVED,
    amount: string,
    destinationAddress: PublicBlockchainAddress,
    approvalRequest: IntentApprovalRequest
  ): CollateralWithdrawalTransactionIntentResponse {
    const id: string = uuid();
    const newApprovalRequest: ApprovalRequest = {
      FireblocksIntentId: approvalRequest.FireblocksIntentId,
      PartnerIntentId: id,
    };
    const newWithdrawalTransactionIntent: CollateralWithdrawalTransactionIntentResponse = {
      id: id,
      status: status,
      amount: amount,
      destinationAddress: destinationAddress,
      approvalRequest: newApprovalRequest,
    };

    if (status === CollateralTransactionIntentStatus.REJECTED) {
      newWithdrawalTransactionIntent.rejectionReason = 'Rejected due to ongoing settlement';
    }

    this.initiateWithdrawalTransactionRepository.create(newWithdrawalTransactionIntent);
    return newWithdrawalTransactionIntent;
  }

  public getCollateralWithdrawalTransactions(): CollateralWithdrawalTransaction[] {
    const withdrawalTransaction = this.withdrawalTransactionRepository.list();

    return withdrawalTransaction;
  }

  public createCollateralWithdrawalTransaction(
    collateralTxId: string,
    approvalRequest: ApprovalRequest,
    status: CollateralWithdrawalTransactionStatus = CollateralWithdrawalTransactionStatus.APPROVED
  ): CollateralWithdrawalTransaction {
    const newWithdrawalTransaction: CollateralWithdrawalTransaction = {
      id: collateralTxId,
      approvalRequest: approvalRequest,
      status: status,
      collateralTxId: collateralTxId,
    };

    if (status === CollateralWithdrawalTransactionStatus.REJECTED) {
      newWithdrawalTransaction.rejectionReason = 'Rejected due to ongoing settlement';
    }

    this.withdrawalTransactionRepository.create(newWithdrawalTransaction);
    return newWithdrawalTransaction;
  }

  public getCollateralwithdrawalTransactionDetails(id: string): CollateralWithdrawalTransaction {
    const withdrawalTransaction = this.withdrawalTransactionRepository.find(id);

    if (!withdrawalTransaction) {
      throw new NotFound('id not found');
    }

    return withdrawalTransaction;
  }

  public getCurrentSettlementInstructions(): SettlementInstructions {
    const currentSettlement = this.settlementRepository.list();

    return currentSettlement[0];
  }

  public getSettlementDetails(settlementVersion: string): SettlementState {
    const settlementInstructions = this.settlementStateRepository.find(settlementVersion);

    if (!settlementInstructions) {
      throw new NotFound(`settlementInstructions for settlementVersion: ${settlementVersion}`);
    }

    return settlementInstructions;
  }

  public initiateSettlement(version: string): SettlementInstructions {
    const initiateSettlement = this.settlementRepository.find(version);

    if (!initiateSettlement) {
      throw new NotFound(`settlementVersion: ${version} is out dated please fetch latest`);
    }

    return initiateSettlement;
  }
}
