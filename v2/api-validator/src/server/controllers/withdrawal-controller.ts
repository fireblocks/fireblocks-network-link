import _ from 'lodash';
import { randomUUID } from 'crypto';
import { XComError } from '../../error';
import { Repository } from './repository';
import { fakeSchemaObject } from '../../schemas';
import { JSONSchemaFaker } from 'json-schema-faker';
import { AssetsController } from './assets-controller';
import {
  BlockchainWithdrawalRequest,
  FiatWithdrawalRequest,
  IbanCapability,
  InternalTransferCapability,
  InternalTransferDestinationPolicy,
  InternalTransferMethod,
  InternalWithdrawalRequest,
  PeerAccountTransferCapability,
  PeerAccountWithdrawalRequest,
  PublicBlockchainCapability,
  SwiftCapability,
  TransferCapability,
  Withdrawal,
  WithdrawalCapability,
  WithdrawalStatus,
  CryptocurrencySymbol,
  Blockchain,
} from '../../client/generated';
import { AccountsController } from './accounts-controller';
import { loadCapabilitiesJson } from './capabilities-loader';

export type WithdrawalRequest =
  | FiatWithdrawalRequest
  | BlockchainWithdrawalRequest
  | PeerAccountWithdrawalRequest
  | InternalWithdrawalRequest;

type Order = 'asc' | 'desc';

export class WithdrawalNotFoundError extends XComError {
  constructor() {
    super('Withdrawal not found');
  }
}

export class UnknownAssetError extends XComError {
  constructor() {
    super('Unknown asset');
  }
}

export class TransferNotSupportedError extends XComError {
  constructor() {
    super('Transfer not supported');
  }
}

export class TransferDestinationNotAllowed extends XComError {
  constructor() {
    super('Transfer destination is not allowed');
  }
}

const DEFAULT_CAPABILITIES_COUNT = 50;
const DEFAULT_WITHDRAWALS_COUNT = 100;

export class WithdrawalController {
  private readonly withdrawalRepository = new Repository<Withdrawal>();
  private readonly withdrawalCapabilityRepository = new Repository<WithdrawalCapability>();

  constructor(private readonly accountId: string) {
    this.loadWithdrawalCapabilities();

    for (let i = 0; i < DEFAULT_WITHDRAWALS_COUNT; i++) {
      this.withdrawalRepository.create(fakeSchemaObject('Withdrawal') as Withdrawal);
    }

    const knownAssetIds = AssetsController.getAllAdditionalAssets().map((a) => a.id);

    injectKnownAssetIdsToWithdrawals(knownAssetIds, this.withdrawalRepository);
    injectKnownAssetIdsToWithdrawalCapabilities(knownAssetIds, this.withdrawalCapabilityRepository);
    this.withdrawalCapabilityRepository.removeDuplicatesBy((dc) => {
      return {
        asset: dc.withdrawal.asset,
        transferMethod: dc.withdrawal.transferMethod,
      };
    });
  }

  private loadWithdrawalCapabilities() {
    const capabilities =
      loadCapabilitiesJson(`withdrawals-${this.accountId}.json`) ??
      WithdrawalController.generateWithdrawalCapabilities();

    this.withdrawalCapabilityRepository.clear();

    for (const capability of capabilities) {
      this.withdrawalCapabilityRepository.create(capability);
    }
  }

  private static generateWithdrawalCapabilities() {
    const capabilities: WithdrawalCapability[] = [];

    for (let i = 0; i < DEFAULT_CAPABILITIES_COUNT; i++) {
      capabilities.push(fakeSchemaObject('WithdrawalCapability') as WithdrawalCapability);
    }

    return capabilities;
  }

  private withdrawalFromWithdrawalRequest(request: WithdrawalRequest): Withdrawal {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { idempotencyKey, ...withdrawalRequest } = request;
    return {
      id: randomUUID(),
      status: WithdrawalStatus.PENDING,
      createdAt: new Date().toISOString(),
      ...withdrawalRequest,
    };
  }

  public getCapabilites(): WithdrawalCapability[] {
    return this.withdrawalCapabilityRepository.list();
  }

  public getWithdrawals(order: Order): Withdrawal[] {
    const withdrawals = this.withdrawalRepository.list();
    return _.orderBy(withdrawals, 'createdAt', order);
  }

  public getWithdrawal(withdrawalId: string): Withdrawal {
    const withdrawal = this.withdrawalRepository.find(withdrawalId);

    if (!withdrawal) {
      throw new WithdrawalNotFoundError();
    }

    return withdrawal;
  }

  public getSubAccountWithdrawals(order: Order): Withdrawal[] {
    const withdrawals = this.getWithdrawals(order);
    return withdrawals.filter(
      (withdrawal) =>
        withdrawal.destination.transferMethod ===
        InternalTransferMethod.transferMethod.INTERNAL_TRANSFER
    );
  }

  public getPeerAccountWithdrawals(order: Order): Withdrawal[] {
    const withdrawals = this.getWithdrawals(order);
    return withdrawals.filter(
      (withdrawal) =>
        withdrawal.destination.transferMethod ===
        PeerAccountTransferCapability.transferMethod.PEER_ACCOUNT_TRANSFER
    );
  }

  public getFiatWithdrawals(order: Order): Withdrawal[] {
    const fiatTransferMethods: string[] = [
      IbanCapability.transferMethod.IBAN,
      SwiftCapability.transferMethod.SWIFT,
    ];
    const withdrawals = this.getWithdrawals(order);
    return withdrawals.filter((withdrawal) =>
      fiatTransferMethods.includes(withdrawal.destination.transferMethod)
    );
  }

  public getBlockchainWithdrawals(order: Order): Withdrawal[] {
    const withdrawals = this.getWithdrawals(order);
    return withdrawals.filter(
      (withdrawal) =>
        withdrawal.destination.transferMethod ===
        PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN
    );
  }

  private validateDirectParentOnlyTransfer(
    request: InternalWithdrawalRequest,
    srcAccountId: string,
    capability: InternalTransferCapability
  ): XComError[] {
    const errors: XComError[] = [];
    if (
      capability.destinationPolicy == InternalTransferDestinationPolicy.DIRECT_PARENT_ACCOUNT &&
      !AccountsController.isParentAccount(srcAccountId, request.destination.accountId, 1)
    ) {
      errors.push(new TransferDestinationNotAllowed());
    }
    return errors;
  }

  public createSubAccountWithdrawal(
    request: InternalWithdrawalRequest,
    accountId: string
  ): Withdrawal {
    return this.createWithdrawal(request, accountId, this.validateDirectParentOnlyTransfer);
  }

  public createPeerAccountWithdrawal(request: PeerAccountWithdrawalRequest): Withdrawal {
    return this.createWithdrawal(request);
  }

  public createBlockchainWithdrawal(request: BlockchainWithdrawalRequest): Withdrawal {
    return this.createWithdrawal(request);
  }

  public createFiatWithdrawal(request: FiatWithdrawalRequest): Withdrawal {
    return this.createWithdrawal(request);
  }

  public createWithdrawal<R extends WithdrawalRequest, C extends TransferCapability>(
    request: R,
    accountId?: string,
    validator?: (req: R, accountId: string, capability: C) => XComError[]
  ): Withdrawal {
    const capability = this.withdrawalCapabilityRepository.findBy(
      (wc) =>
        wc.withdrawal.transferMethod === request.destination.transferMethod &&
        _.isEqual(wc.withdrawal.asset, request.destination.asset)
    );

    const errors: XComError[] = [];

    if (
      !AssetsController.isKnownAsset(request.destination.asset) ||
      !AssetsController.isKnownAsset(request.balanceAsset)
    ) {
      errors.push(new UnknownAssetError());
    }

    if (capability === undefined) {
      errors.push(new TransferNotSupportedError());
    } else if (validator && accountId) {
      errors.push(...validator(request, accountId, capability.withdrawal as C));
    }

    if (errors.length > 0) {
      throw JSONSchemaFaker.random.pick(errors) as XComError;
    }

    const withdrawal = this.withdrawalFromWithdrawalRequest(request);
    this.withdrawalRepository.create(withdrawal);
    return withdrawal;
  }
}

function injectKnownAssetIdsToWithdrawals(
  knownAssetIds: string[],
  withdrawalRepository: Repository<Withdrawal>
): void {
  for (const { id } of withdrawalRepository.list()) {
    const withdrawal = withdrawalRepository.find(id);
    if (!withdrawal) {
      throw new Error('Not possible!');
    }

    if ('assetId' in withdrawal.balanceAsset) {
      withdrawal.balanceAsset.assetId = JSONSchemaFaker.random.pick(knownAssetIds);
    }

    if ('assetId' in withdrawal.destination.asset) {
      withdrawal.destination.asset.assetId = JSONSchemaFaker.random.pick(knownAssetIds);
    }
  }
}

function injectKnownAssetIdsToWithdrawalCapabilities(
  knownAssetIds: string[],
  withdrawalCapabilityRepository: Repository<WithdrawalCapability>
): void {
  for (const { id } of withdrawalCapabilityRepository.list()) {
    const capability = withdrawalCapabilityRepository.find(id);
    if (!capability) {
      throw new Error('Not possible!');
    }

    if ('assetId' in capability.balanceAsset) {
      capability.balanceAsset.assetId = JSONSchemaFaker.random.pick(knownAssetIds);
    }

    if ('assetId' in capability.withdrawal.asset) {
      capability.withdrawal.asset.assetId = JSONSchemaFaker.random.pick(knownAssetIds);
    }
  }
}
