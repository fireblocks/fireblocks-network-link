import { SUPPORTED_ASSETS } from './assets-controller';
import {
  CrossAccountTransferCapability,
  DepositCapability,
  IbanCapability,
  Layer1Cryptocurrency,
  Layer2Cryptocurrency,
  NationalCurrencyCode,
  PublicBlockchainCapability,
  SwiftCapability,
} from '../../client/generated';

export const DEPOSIT_METHODS: DepositCapability[] = [
  {
    id: 'dd59e6d1-c8ca-4499-8b3f-786ce417ed17',
    balanceAsset: { nationalCurrencyCode: NationalCurrencyCode.USD },
    deposit: {
      asset: { nationalCurrencyCode: NationalCurrencyCode.USD },
      transferMethod: IbanCapability.transferMethod.IBAN,
    },
  },
  {
    id: '9b8bc02b-7fa0-4588-9f48-0cb09cd5c3ed',
    balanceAsset: { assetId: SUPPORTED_ASSETS[0].id },
    deposit: {
      asset: { cryptocurrencySymbol: Layer1Cryptocurrency.ETH },
      transferMethod: PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN,
    },
  },
  {
    id: '3daa7f42-4516-4400-bab1-0dbd14c7471f',
    balanceAsset: { cryptocurrencySymbol: Layer2Cryptocurrency.MATIC },
    deposit: {
      asset: { nationalCurrencyCode: NationalCurrencyCode.MXN },
      transferMethod: SwiftCapability.transferMethod.SWIFT,
    },
  },
  {
    id: 'ab935ca1-8cc8-442e-9b6f-9cef4d0c5004',
    balanceAsset: { cryptocurrencySymbol: Layer2Cryptocurrency.MATIC },
    deposit: {
      asset: { nationalCurrencyCode: NationalCurrencyCode.MXN },
      transferMethod: CrossAccountTransferCapability.transferMethod.INTERNAL_TRANSFER,
    },
  },
];
