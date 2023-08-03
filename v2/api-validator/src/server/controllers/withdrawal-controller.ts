import { SUPPORTED_ASSETS } from './assets-controller';
import {
  CrossAccountTransferCapability,
  IbanCapability,
  Layer1Cryptocurrency,
  Layer2Cryptocurrency,
  NationalCurrencyCode,
  PublicBlockchainCapability,
  SwiftCapability,
  Withdrawal,
  WithdrawalCapability,
  WithdrawalStatus,
} from '../../client/generated';
import { ACCOUNTS } from './accounts-controller';

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
      asset: { cryptocurrencySymbol: Layer1Cryptocurrency.ETH },
      transferMethod: PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN,
    },
  },
  {
    id: 'fdd88a6d-e9d7-4e30-a495-a8867839f83b',
    balanceAsset: { cryptocurrencySymbol: Layer2Cryptocurrency.MATIC },
    withdrawal: {
      asset: { nationalCurrencyCode: NationalCurrencyCode.MXN },
      transferMethod: SwiftCapability.transferMethod.SWIFT,
    },
  },
  {
    id: '4ae61af1-1c23-43ec-8ff6-8892789a266c',
    balanceAsset: { cryptocurrencySymbol: Layer2Cryptocurrency.MATIC },
    withdrawal: {
      asset: { nationalCurrencyCode: NationalCurrencyCode.MXN },
      transferMethod: CrossAccountTransferCapability.transferMethod.INTERNAL_TRANSFER,
    },
  },
];

const WITHDRAWALS: Withdrawal[] = [
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
    id: '0f824bd8-d8ff-4f90-85df-d27089e0e3c0',
    balanceAmount: '0.1',
    balanceAsset: { cryptocurrencySymbol: Layer1Cryptocurrency.BTC },
    createdAt: '2022-03-09T12:36:38.357Z',
    destination: {
      transferMethod: CrossAccountTransferCapability.transferMethod.INTERNAL_TRANSFER,
      asset: { cryptocurrencySymbol: Layer1Cryptocurrency.BTC },
      amount: '0.1',
      accountId: ACCOUNTS[0].id,
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

const ACCOUNT_WITHDRAWALS_MAP = new Map<string, Withdrawal[]>(
  ACCOUNTS.map((account) => [account.id, WITHDRAWALS])
);

export function getAccountWithdrawals(accountId: string): Withdrawal[] {
  return ACCOUNT_WITHDRAWALS_MAP.get(accountId) ?? [];
}

export function getSingleAccountWithdrawal(
  accountId: string,
  withdrawalId: string
): Withdrawal | undefined {
  const withdrawals = getAccountWithdrawals(accountId);
  return withdrawals.find((withdrawal) => withdrawal.id === withdrawalId);
}

export function getAccountSubAccountWithdrawals(accountId: string): Withdrawal[] {
  const withdrawals = getAccountWithdrawals(accountId);
  return withdrawals.filter(
    (withdrawal) =>
      withdrawal.destination.transferMethod ===
      CrossAccountTransferCapability.transferMethod.INTERNAL_TRANSFER
  );
}

export function getAccountPeerAccountWithdrawals(accountId: string): Withdrawal[] {
  const withdrawals = getAccountWithdrawals(accountId);
  return withdrawals.filter(
    (withdrawal) =>
      withdrawal.destination.transferMethod ===
      CrossAccountTransferCapability.transferMethod.PEER_ACCOUNT_TRANSFER
  );
}

export function getAccountFiatWithdrawals(accountId: string): Withdrawal[] {
  const fiatTransferMethods: string[] = [
    IbanCapability.transferMethod.IBAN,
    SwiftCapability.transferMethod.SWIFT,
  ];
  const withdrawals = getAccountWithdrawals(accountId);
  return withdrawals.filter((withdrawal) =>
    fiatTransferMethods.includes(withdrawal.destination.transferMethod)
  );
}

export function getAccountBlockchainWithdrawals(accountId: string): Withdrawal[] {
  const withdrawals = getAccountWithdrawals(accountId);
  return withdrawals.filter(
    (withdrawal) =>
      withdrawal.destination.transferMethod ===
      PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN
  );
}
