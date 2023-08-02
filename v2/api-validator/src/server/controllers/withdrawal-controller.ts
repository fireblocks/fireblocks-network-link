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

const WITHDRAWALS: Withdrawal[] = [];
