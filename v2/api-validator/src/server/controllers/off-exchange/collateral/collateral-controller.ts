import { Repository } from '../../repository';
import {
  CollateralAccountLink,
  CollateralAccount,
  CollateralLinkStatus,
  Environment,
  CollateralAsset,
  Blockchain,
  CryptocurrencySymbol,
  NativeCryptocurrency,
  CollateralAssetAddress,
  CollateralAddress,
  PublicBlockchainAddress,
  CollateralDepositTransactionStatus,
  CollateralDepositTransaction,
  CollateralWithdrawalTransaction,
  CollateralWithdrawalTransactionStatus,
  SettlementInstructions,
  PublicBlockchainCapability,
  SettlementState,
} from '../../../../client/generated';
import { v4 as uuid } from 'uuid';
import { XComError } from '../../../../error';
import { fakeSchemaObject } from '../../../../schemas';

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

function isUUIDv4(uuid: string): boolean {
  const uuidv4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidv4Regex.test(uuid);
}

function isPositiveAmount(amount: string): boolean {
  const uuidv4Regex = /^\d+(\.\d+)?/i;
  return uuidv4Regex.test(amount);
}

export class CollateralController {
  private readonly accountLinksRepository = new Repository<CollateralAccountLink>();
  private readonly depositAddressesRepository = new Repository<CollateralAssetAddress>();
  private readonly depositTransactionRepository = new Repository<CollateralDepositTransaction>();
  private readonly withdrawalTransactionRepository =
    new Repository<CollateralWithdrawalTransaction>();
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
      depositAddress.address.asset = depositAddress.asset;
      this.depositAddressesRepository.create(depositAddress);

      const setllementState = fakeSchemaObject('SettlementState') as SettlementStateIdentifier;
      this.settlementStateRepository.create(setllementState);
    }
  }

  public generateCollateralAssets(numAssets: number, env: Environment): CollateralAsset[] {
    const assets: CollateralAsset[] = [];

    for (let i = 0; i < numAssets; i++) {
      assets.push(this.createCollateralAsset(env));
    }

    return assets;
  }

  private createCollateralAsset(env: Environment): NativeCryptocurrency {
    const isTestAsset: boolean = env === Environment.SANDBOX ? true : false;
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
      collateralAccount.collateralId === '10' ||
      collateralAccount.collateralSigners[0] === '10'
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

  public getCollateralDepositAddresses(): CollateralAssetAddress[] {
    const CollateralDepositAddress = this.depositAddressesRepository.list();

    return CollateralDepositAddress;
  }

  public createCollateralDepositAddressForAsset(
    address: PublicBlockchainAddress,
    recoveryAccountId: string,
    fireblocksAssetId: string,
    accountId: string
  ): CollateralAssetAddress {
    const asset: NativeCryptocurrency = this.createCollateralAsset(Environment.PROD);
    const newCollateralDepositAddress: CollateralAssetAddress = {
      id: accountId,
      address: address,
      recoveryAccountId: recoveryAccountId,
      asset: asset,
      fireblocksAssetId: fireblocksAssetId,
    };
    this.depositAddressesRepository.create(newCollateralDepositAddress);
    return newCollateralDepositAddress;
  }

  public getCollateralDepositAddressesForAsset(fireblocksAssetId: string): CollateralAddress[] {
    const CollateralDepositAddress = this.depositAddressesRepository.list();

    const CollateralDepositAddressForAsset = CollateralDepositAddress.filter(
      (address) => address.fireblocksAssetId === fireblocksAssetId
    );

    if (!CollateralDepositAddressForAsset) {
      throw new NotFound('fireblocksAssetId');
    }

    return CollateralDepositAddressForAsset;
  }

  public registerCollateralDepositTransaction(
    status: CollateralDepositTransactionStatus | undefined,
    amount: string | undefined,
    collateralTxId: string,
    fireblocksAssetId: string,
    accountId: string,
    collateralId: string
  ): CollateralDepositTransaction {
    if (!isUUIDv4(accountId)) {
      throw new NotValid('accountId');
    }

    const collateralIdsList = collateralId.split('.');
    if (collateralIdsList[1] !== accountId) {
      throw new NotValid('collateralId');
    }

    for (const id of collateralIdsList) {
      if (!isUUIDv4(id)) {
        throw new NotValid('collateralId');
      }
    }
    if (amount != undefined) {
      if (!isPositiveAmount(amount)) {
        throw new NotValid('amount');
      }
    }
    const newCollateralDepositTransaction: CollateralDepositTransaction = {
      id: collateralTxId,
      collateralTxId: collateralTxId,
      fireblocksAssetId: fireblocksAssetId,
      amount: amount,
      status: status,
    };
    this.depositTransactionRepository.create(newCollateralDepositTransaction);
    return newCollateralDepositTransaction;
  }

  public getCollateralDepositTransactions(): CollateralDepositTransaction[] {
    const collateralDepositTransactions = this.depositTransactionRepository.list();

    return collateralDepositTransactions;
  }

  public getCollateralDepositTransactionDetails(
    collateralTxId: string
  ): CollateralDepositTransaction {
    const collateralDepositTransaction = this.depositTransactionRepository.find(collateralTxId);

    if (!collateralDepositTransaction) {
      throw new NotFound('collateralTxId');
    }

    return collateralDepositTransaction;
  }

  public initiateCollateralWithdrawalTransaction(
    amount: string,
    fireblocksAssetId: string,
    accountId: string
  ): CollateralWithdrawalTransaction {
    if (!isPositiveAmount(amount)) {
      throw new NotValid('Amount');
    }

    if (typeof fireblocksAssetId !== 'string') {
      throw new NotValid('fireblocksAssetId');
    }

    const status = CollateralWithdrawalTransactionStatus.REJECTED;
    const collateralTxId = `1.${accountId}.${accountId}`;

    const newWithdrawalTransaction: CollateralWithdrawalTransaction = {
      id: collateralTxId,
      collateralTxId: collateralTxId,
      withdrawalTxBlockchainId:
        '0xb00b8884d17a737be3088ab222a600ef1a2ad3612a0f74406dfbb7039fdb051e',
      status: status,
      rejectionReason: 'Rejected due to ongoing settlement',
    };

    this.withdrawalTransactionRepository.create(newWithdrawalTransaction);
    return newWithdrawalTransaction;
  }

  public getCollateralWithdrawalTransactions(): CollateralWithdrawalTransaction[] {
    const withdrawalTransaction = this.withdrawalTransactionRepository.list();

    return withdrawalTransaction;
  }

  public getCollateralwithdrawalTransactionDetails(
    collateralTxId: string
  ): CollateralWithdrawalTransaction {
    const withdrawalTransaction = this.withdrawalTransactionRepository.find(collateralTxId);

    if (!withdrawalTransaction) {
      throw new NotFound('collateralTxId');
    }

    return withdrawalTransaction;
  }

  public initiateSettlement(
    settlementVersion: string | undefined,
    settlementId: string,
    accountId: string,
    collateralId: string
  ): SettlementInstructions {
    const newSettlement: SettlementInstructionsIdentifier = {
      id: accountId,
      settlementVersion: settlementVersion,
      withdrawInstructions: [
        {
          fireblocksAssetId: settlementId,
          amount: '5',
          fee: '0.005',
          sourceAddress: {
            asset: {
              blockchain: Blockchain.ALGORAND,
              cryptocurrencySymbol: CryptocurrencySymbol.ALGO,
              testAsset: true,
            },
            transferMethod: PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN,
            address: 'str',
            addressTag: 'str',
          },
        },
      ],
      depositInstructions: [
        {
          fireblocksAssetId: 'str',
          amount: '5',
          destinationAddress: {
            asset: {
              blockchain: Blockchain.ALGORAND,
              cryptocurrencySymbol: CryptocurrencySymbol.ALGO,
              testAsset: true,
            },
            transferMethod: PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN,
            address: 'str',
            addressTag: collateralId,
          },
        },
      ],
    };

    this.settlementRepository.create(newSettlement);

    return newSettlement;
  }

  public getCurrentSettlementInstructions(settlementVersion: string): SettlementInstructions {
    const settlement = this.settlementRepository.find(settlementVersion);

    if (!settlement) {
      throw new NotFound('settlementVersion');
    }

    return settlement;
  }

  public getSettlementDetails(): SettlementState {
    const settlementState = this.settlementStateRepository.list();

    return settlementState[0];
  }
}
