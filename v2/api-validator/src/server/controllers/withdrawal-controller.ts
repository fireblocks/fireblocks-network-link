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
  InternalTransferDestination,
  InternalWithdrawal,
  InternalWithdrawalRequest,
  PeerAccountTransferCapability,
  PeerAccountWithdrawalRequest,
  PublicBlockchainCapability,
  SwiftCapability,
  Withdrawal,
  WithdrawalCapability,
  WithdrawalStatus,
} from '../../client/generated';
import transferMethod = InternalTransferCapability.transferMethod;
import logger from '../../logging';
import { createFiatWithdrawal } from '../handlers';
import { AccountsController } from './accounts-controller';

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
const DEFAULT_WITHDRAWALS_COUNT = 30;

const log = logger('server:WithdrawalController');

export class WithdrawalController {
  private readonly withdrawalRepository = new Repository<Withdrawal>();
  private readonly withdrawalCapabilityRepository = new Repository<WithdrawalCapability>();

  constructor() {
    for (let i = 0; i < DEFAULT_CAPABILITIES_COUNT; i++) {
      this.withdrawalRepository.create(fakeSchemaObject('Withdrawal') as Withdrawal);
    }

    for (let i = 0; i < DEFAULT_WITHDRAWALS_COUNT; i++) {
      this.withdrawalCapabilityRepository.create(
        fakeSchemaObject('WithdrawalCapability') as WithdrawalCapability
      );
    }

    const knownAssetIds = AssetsController.getAllAdditionalAssets().map((a) => a.id);

    injectKnownAssetIdsToWithdrawals(knownAssetIds, this.withdrawalRepository);
    injectKnownAssetIdsToWithdrawalCapabilities(knownAssetIds, this.withdrawalCapabilityRepository);
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
        InternalTransferCapability.transferMethod.INTERNAL_TRANSFER
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

  private validateParentOnlyTransfer(
    destination: InternalTransferDestination,
    srcAccountId: string
  ): void {
    if (
      destination.limitations?.parentOnly &&
      !AccountsController.isParentAccount(srcAccountId, destination.accountId)
    ) {
      throw new TransferDestinationNotAllowed();
    }
  }

  public createSubAccountWithdrawal(
    request: InternalWithdrawalRequest,
    accountId: string
  ): Withdrawal {
    this.validateParentOnlyTransfer(request.destination, accountId);
    return this.createWithdrawal(request);
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

  public createWithdrawal<R extends WithdrawalRequest>(request: R): Withdrawal {
    const capability = this.withdrawalCapabilityRepository.findBy(
      (wc) =>
        wc.withdrawal.transferMethod === request.destination.transferMethod &&
        _.isEqual(wc.balanceAsset, request.balanceAsset)
    );

    if (capability === undefined) {
      throw new TransferNotSupportedError();
    }

    log.info(typeof request);

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
