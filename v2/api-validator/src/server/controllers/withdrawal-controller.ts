/* eslint-disable @typescript-eslint/no-unused-vars */
import _ from 'lodash';
import { randomUUID } from 'crypto';
import { XComError } from '../../error';
import { Repository } from './repository';
import { SUPPORTED_ASSETS } from './assets-controller';
import {
  BlockchainWithdrawalRequest,
  CrossAccountTransferCapability,
  CrossAccountWithdrawalRequest,
  FiatWithdrawalRequest,
  IbanCapability,
  Layer1Cryptocurrency,
  NationalCurrencyCode,
  PublicBlockchainCapability,
  SwiftCapability,
  Withdrawal,
  WithdrawalCapability,
  WithdrawalStatus,
} from '../../client/generated';

export const WITHDRAWAL_METHODS: WithdrawalCapability[] = [
  {
    id: 'e4dee3be-ae75-41d7-83e3-cc29360969b1',
    balanceAsset: { nationalCurrencyCode: NationalCurrencyCode.USD },
    withdrawal: {
      asset: { nationalCurrencyCode: NationalCurrencyCode.USD },
      transferMethod: IbanCapability.transferMethod.IBAN,
    },
  },
  {
    id: '1c560908-8704-4706-a732-ab4a54160297',
    balanceAsset: { assetId: SUPPORTED_ASSETS[0].id },
    withdrawal: {
      asset: { cryptocurrencySymbol: Layer1Cryptocurrency.BTC },
      transferMethod: PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN,
    },
    minWithdrawalAmount: '1',
  },
  {
    id: 'fdd88a6d-e9d7-4e30-a495-a8867839f83b',
    balanceAsset: { nationalCurrencyCode: NationalCurrencyCode.MXN },
    withdrawal: {
      asset: { nationalCurrencyCode: NationalCurrencyCode.MXN },
      transferMethod: SwiftCapability.transferMethod.SWIFT,
    },
  },
  {
    id: '4ae61af1-1c23-43ec-8ff6-8892789a266c',
    balanceAsset: { nationalCurrencyCode: NationalCurrencyCode.USD },
    withdrawal: {
      asset: { nationalCurrencyCode: NationalCurrencyCode.USD },
      transferMethod: CrossAccountTransferCapability.transferMethod.INTERNAL_TRANSFER,
    },
  },
  {
    id: '4ae61af1-1c23-43ec-8ff6-8892789a266c',
    balanceAsset: { cryptocurrencySymbol: Layer1Cryptocurrency.BTC },
    withdrawal: {
      asset: { cryptocurrencySymbol: Layer1Cryptocurrency.BTC },
      transferMethod: CrossAccountTransferCapability.transferMethod.PEER_ACCOUNT_TRANSFER,
    },
  },
];

export const WITHDRAWALS: Withdrawal[] = [
  {
    id: 'bbe93e60-da8b-43bb-bebb-19e41421e9d1',
    balanceAmount: '1.123',
    balanceAsset: { nationalCurrencyCode: NationalCurrencyCode.CAD },
    createdAt: '2001-03-04T21:46:38.357Z',
    destination: {
      transferMethod: SwiftCapability.transferMethod.SWIFT,
      asset: { nationalCurrencyCode: NationalCurrencyCode.CAD },
      amount: '1.123',
      accountHolder: { name: 'You Know Who' },
      swiftCode: 'KPKUJWXMLDB',
      routingNumber: '8d73hc7sj8',
    },
    status: WithdrawalStatus.PENDING,
  },
  {
    id: '2fe45f03-1674-4467-9ae0-806712327341',
    balanceAmount: '736.8',
    balanceAsset: { cryptocurrencySymbol: Layer1Cryptocurrency.BTC },
    createdAt: '2020-03-09T08:26:38.357Z',
    destination: {
      transferMethod: PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN,
      asset: { cryptocurrencySymbol: Layer1Cryptocurrency.BTC },
      amount: '736.8',
      address: '15xFLzGSxtavdSqBd6YzLCw55u3BZFt54a',
    },
    status: WithdrawalStatus.SUCCEEDED,
    finalizedAt: '2020-03-09T09:12:45.463Z',
  },
  {
    id: 'f54a2975-36dc-4013-a96d-be2ee5caf882',
    balanceAmount: '0.1',
    balanceAsset: { cryptocurrencySymbol: Layer1Cryptocurrency.BTC },
    createdAt: '2022-03-09T12:36:38.357Z',
    destination: {
      transferMethod: CrossAccountTransferCapability.transferMethod.INTERNAL_TRANSFER,
      asset: { cryptocurrencySymbol: Layer1Cryptocurrency.BTC },
      amount: '0.1',
      accountId: '1',
    },
    status: WithdrawalStatus.FAILED,
    finalizedAt: '2022-03-09T09:12:45.463Z',
  },
  {
    id: '2dc1bcf6-ac90-477e-9d36-a8a120addf50',
    balanceAmount: '1000',
    balanceAsset: { nationalCurrencyCode: NationalCurrencyCode.USD },
    createdAt: '2012-06-18T23:42:31.337Z',
    destination: {
      transferMethod: IbanCapability.transferMethod.IBAN,
      asset: { nationalCurrencyCode: NationalCurrencyCode.USD },
      amount: '1000',
      accountHolder: { name: 'Bob Haggins' },
      iban: 'LO16MVPcSq8',
    },
    finalizedAt: '2012-06-18T23:42:35.321Z',
    status: WithdrawalStatus.SUCCEEDED,
  },
  {
    id: '0f824bd8-d8ff-4f90-85df-d27089e0e3c0',
    balanceAmount: '555',
    balanceAsset: { assetId: SUPPORTED_ASSETS[0].id },
    createdAt: '2023-07-03T07:21:46.191Z',
    destination: {
      transferMethod: CrossAccountTransferCapability.transferMethod.PEER_ACCOUNT_TRANSFER,
      asset: { assetId: SUPPORTED_ASSETS[0].id },
      amount: '555',
      accountId: '306a95e7-26a5-4398-a36c-8f813f7376da',
    },
    status: WithdrawalStatus.SUCCEEDED,
    finalizedAt: '2023-07-04T05:18:43.921Z',
  },
];

export type WithdrawalRequest =
  | FiatWithdrawalRequest
  | BlockchainWithdrawalRequest
  | CrossAccountWithdrawalRequest;

type Order = 'asc' | 'desc';

export class WithdrawalNotFoundError extends XComError {
  constructor() {
    super('Withdrawal not found');
  }
}

export class WithdrawalController {
  private readonly withdrawalRepository = new Repository<Withdrawal>();

  constructor(withdrawals: Withdrawal[]) {
    for (const withdrawal of withdrawals) {
      this.withdrawalRepository.create(withdrawal);
    }
  }

  private withdrawalFromWithdrawalRequest(request: WithdrawalRequest): Withdrawal {
    const { idempotencyKey, ...withdrawalRequest } = request;
    return {
      id: randomUUID(),
      status: WithdrawalStatus.PENDING,
      createdAt: new Date().toISOString(),
      ...withdrawalRequest,
    };
  }

  public getAccountWithdrawals(order: Order): Withdrawal[] {
    const withdrawals = this.withdrawalRepository.list();
    return _.orderBy(withdrawals, 'createdAt', order);
  }

  public getAccountWithdrawal(withdrawalId: string): Withdrawal {
    const withdrawal = this.withdrawalRepository.find(withdrawalId);

    if (!withdrawal) {
      throw new WithdrawalNotFoundError();
    }

    return withdrawal;
  }

  public getAccountSubAccountWithdrawals(order: Order): Withdrawal[] {
    const withdrawals = this.getAccountWithdrawals(order);
    return withdrawals.filter(
      (withdrawal) =>
        withdrawal.destination.transferMethod ===
        CrossAccountTransferCapability.transferMethod.INTERNAL_TRANSFER
    );
  }

  public getAccountPeerAccountWithdrawals(order: Order): Withdrawal[] {
    const withdrawals = this.getAccountWithdrawals(order);
    return withdrawals.filter(
      (withdrawal) =>
        withdrawal.destination.transferMethod ===
        CrossAccountTransferCapability.transferMethod.PEER_ACCOUNT_TRANSFER
    );
  }

  public getAccountFiatWithdrawals(order: Order): Withdrawal[] {
    const fiatTransferMethods: string[] = [
      IbanCapability.transferMethod.IBAN,
      SwiftCapability.transferMethod.SWIFT,
    ];
    const withdrawals = this.getAccountWithdrawals(order);
    return withdrawals.filter((withdrawal) =>
      fiatTransferMethods.includes(withdrawal.destination.transferMethod)
    );
  }

  public getAccountBlockchainWithdrawals(order: Order): Withdrawal[] {
    const withdrawals = this.getAccountWithdrawals(order);
    return withdrawals.filter(
      (withdrawal) =>
        withdrawal.destination.transferMethod ===
        PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN
    );
  }

  public createAccountWithdrawal(request: WithdrawalRequest): Withdrawal {
    const withdrawal = this.withdrawalFromWithdrawalRequest(request);
    this.withdrawalRepository.create(withdrawal);
    return withdrawal;
  }
}
