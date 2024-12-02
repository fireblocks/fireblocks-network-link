import { Repository } from '../repository';
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
  BadRequestError
} from '../../../client/generated';
import { randomUUID } from 'crypto';
import { XComError } from '../../../error';
import { fakeSchemaObject } from '../../../schemas';

type CollateralIdentifier = { id: string; collateralAccounts: CollateralAccount[] };
type CollateralAccountLinkIdentifier = {
  id: string;
  collateralAccountLinks: CollateralAccountLink[];
};

type SettlementInstructionsIdentifier = {
  id: string;
} & SettlementInstructions;

type SettlementStateIdentifier = {
  id: string;
} & SettlementState;

export class CollateralAccountNotExist extends XComError {
  constructor() {
    super('Collateral Account Not Found');
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
  private readonly collateralAccountLinksRepository =
    new Repository<CollateralAccountLinkIdentifier>();
  private readonly collateralDepositAddressesRepository = new Repository<CollateralAssetAddress>();
  private readonly collateralDepositTransactionRepository =
    new Repository<CollateralDepositTransaction>();
  private readonly collateralWithdrawalTransactionRepository =
    new Repository<CollateralWithdrawalTransaction>();
  private readonly collateralSettlementRepository =
    new Repository<SettlementInstructionsIdentifier>();
  private readonly collateralSettlementStateRepository =
    new Repository<SettlementStateIdentifier>();
  constructor() {
    for (let i = 0; i < 20; i++) {
      const CollateralDepositAddress = fakeSchemaObject(
        'CollateralAssetAddress'
      ) as CollateralAssetAddress;
      CollateralDepositAddress.address.asset = CollateralDepositAddress.asset;
      this.collateralDepositAddressesRepository.create(CollateralDepositAddress);

      const setllementState = fakeSchemaObject('SettlementState') as SettlementStateIdentifier;
      this.collateralSettlementStateRepository.create(setllementState);
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

  public createCollateralAccountLink(
    accountId: string,
    collateralAccount: CollateralAccount
  ): CollateralAccount {
    if (!accountId) {
      throw new CollateralAccountNotExist();
    }

    const collateralIdsList = collateralAccount.collateralId.split('.');
    if (collateralIdsList[1] !== accountId) {
      throw new CollateralAccountNotExist();
    }
    for (const id of collateralIdsList) {
      if (!isUUIDv4(id)) {
        throw new CollateralAccountNotExist();
      }
    }

    for (const signer of collateralAccount.collateralSigners) {
      if (!isUUIDv4(signer)) {
        throw new CollateralAccountNotExist();
      }
    }

    const newCollateralAccountLink: CollateralAccountLink = {
      id: randomUUID(),
      collateralId: collateralAccount.collateralId,
      collateralSigners: collateralAccount.collateralSigners || [],
      eligibleCollateralAssets: this.generateCollateralAssets(2, collateralAccount.env),
      status: CollateralLinkStatus.ELIGIBLE,
      env: Environment.PROD,
    };
    return newCollateralAccountLink;
  }

  public getCollateralAccountLinks(accountId: string): CollateralAccountLink[] {
    const collateralLinks = this.collateralAccountLinksRepository.find(accountId);

    return collateralLinks?.collateralAccountLinks || [];
  }

  public getCollateralDepositAddresses(): CollateralAssetAddress[] {
    const CollateralDepositAddress = this.collateralDepositAddressesRepository.list();

    if (!CollateralDepositAddress) {
      throw new CollateralAccountNotExist();
    }

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
    this.collateralDepositAddressesRepository.create(newCollateralDepositAddress);
    return newCollateralDepositAddress;
  }

  public getCollateralDepositAddressesForAsset(fireblocksAssetId: string): CollateralAddress[] {
    const CollateralDepositAddress = this.collateralDepositAddressesRepository.list();

    const CollateralDepositAddressForAsset = CollateralDepositAddress.filter(
      (address) => address.fireblocksAssetId === fireblocksAssetId
    );

    if (!CollateralDepositAddressForAsset) {
      throw new CollateralAccountNotExist();
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
      throw new CollateralAccountNotExist();
    }

    const collateralIdsList = collateralId.split('.');
    if (collateralIdsList[1] !== accountId) {
      throw new CollateralAccountNotExist();
    }

    for (const id of collateralIdsList) {
      if (!isUUIDv4(id)) {
        throw new CollateralAccountNotExist();
      }
    }
    if (amount != undefined) {
      if (!isPositiveAmount(amount)) {
        throw new CollateralAccountNotExist();
      }
    }
    const newCollateralDepositTransaction: CollateralDepositTransaction = {
      id: collateralTxId,
      collateralTxId: collateralTxId,
      fireblocksAssetId: fireblocksAssetId,
      amount: amount,
      status: status,
    };
    this.collateralDepositTransactionRepository.create(newCollateralDepositTransaction);
    return newCollateralDepositTransaction;
  }

  public getCollateralDepositTransactions(): CollateralDepositTransaction[] {
    const collateralDepositTransactions = this.collateralDepositTransactionRepository.list();

    if (!collateralDepositTransactions) {
      throw new CollateralAccountNotExist();
    }

    return collateralDepositTransactions;
  }

  public getCollateralDepositTransactionDetails(
    collateralTxId: string
  ): CollateralDepositTransaction {
    const collateralDepositTransaction =
      this.collateralDepositTransactionRepository.find(collateralTxId);

    if (!collateralDepositTransaction) {
      throw new CollateralAccountNotExist();
    }

    return collateralDepositTransaction;
  }

  public initiateCollateralWithdrawalTransaction(
    amount: string,
    fireblocksAssetId: string,
    destinationAddress: PublicBlockchainAddress,
    accountId: string,
    collateralId: string
  ): CollateralWithdrawalTransaction {
    if (!accountId) {
      throw new CollateralAccountNotExist();
    }

    if (!collateralId) {
      throw new CollateralAccountNotExist();
    }

    if (!fireblocksAssetId) {
      throw new CollateralAccountNotExist();
    }

    if (!destinationAddress) {
      throw new CollateralAccountNotExist();
    }

    if (!amount || !isPositiveAmount(amount)) {
      throw new CollateralAccountNotExist();
    }

    const status = CollateralWithdrawalTransactionStatus.REJECTED;
    const collateralTxId = `1.${accountId}.${accountId}`;

    const newcollateralWithdrawalTransaction: CollateralWithdrawalTransaction = {
      id: collateralTxId,
      collateralTxId: collateralTxId,
      withdrawalTxBlockchainId:
        '0xb00b8884d17a737be3088ab222a600ef1a2ad3612a0f74406dfbb7039fdb051e',
      status: status,
      rejectionReason: 'Rejected due to ongoing settlement',
    };
    this.collateralWithdrawalTransactionRepository.create(newcollateralWithdrawalTransaction);
    return newcollateralWithdrawalTransaction;
  }

  public getCollateralWithdrawalTransactions(): CollateralWithdrawalTransaction[] {
    const collateralWithdrawalTransaction = this.collateralWithdrawalTransactionRepository.list();

    if (!collateralWithdrawalTransaction) {
      throw new CollateralAccountNotExist();
    }

    return collateralWithdrawalTransaction;
  }

  public getCollateralwithdrawalTransactionDetails(
    collateralTxId: string
  ): CollateralWithdrawalTransaction {
    const collateralWithdrawalTransaction =
      this.collateralWithdrawalTransactionRepository.find(collateralTxId);

    if (!collateralWithdrawalTransaction) {
      throw new CollateralAccountNotExist();
    }

    return collateralWithdrawalTransaction;
  }

  public initiateSettlement(
    settlementVersion: string | undefined,
    settlementId: string,
    accountId: string,
    collateralId: string
  ): SettlementInstructions {
    if (!accountId) {
      throw new CollateralAccountNotExist();
    }

    if (!collateralId) {
      throw new CollateralAccountNotExist();
    }

    if (!settlementId) {
      throw new CollateralAccountNotExist();
    }

    const newCollateralSettlement: SettlementInstructionsIdentifier = {
      id: accountId,
      settlementVersion: settlementVersion,
      withdrawInstructions: [
        {
          fireblocksAssetId: 'str',
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
            addressTag: 'str',
          },
        },
      ],
    };

    this.collateralSettlementRepository.create(newCollateralSettlement);

    return newCollateralSettlement;
  }

  public getCurrentSettlementInstructions(settlementVersion: string): SettlementInstructions {
    const collateralSettlement = this.collateralSettlementRepository.find(settlementVersion);

    if (!collateralSettlement) {
      throw new CollateralAccountNotExist();
    }

    return collateralSettlement;
  }

  public getSettlementDetails(): SettlementState {
    const collateralSettlementState = this.collateralSettlementStateRepository.list();

    if (!collateralSettlementState) {
      throw new CollateralAccountNotExist();
    }

    return collateralSettlementState[0];
  }
}
