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
  InternalWithdrawalRequest,
  PeerAccountTransferCapability,
  PeerAccountWithdrawalRequest,
  PublicBlockchainCapability,
  SwiftCapability,
  Withdrawal,
  WithdrawalCapability,
  WithdrawalStatus,
} from '../../client/generated';

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

const DEFAULT_CAPABILITIES_COUNT = 50;
const DEFAULT_WITHDRAWALS_COUNT = 5;

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

  public createWithdrawal(request: WithdrawalRequest): Withdrawal {
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
