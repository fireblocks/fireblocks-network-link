import { SUPPORTED_ASSETS, UnknownAdditionalAssetError, isKnownAsset } from './assets-controller';
import {
  CrossAccountTransferCapability,
  DepositAddress,
  DepositAddressCreationRequest,
  DepositAddressStatus,
  DepositCapability,
  DepositDestination,
  IbanCapability,
  Layer1Cryptocurrency,
  Layer2Cryptocurrency,
  NationalCurrencyCode,
  PublicBlockchainCapability,
  SwiftCapability,
} from '../../client/generated';
import { randomUUID } from 'crypto';
import RandExp from 'randexp';

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

const ACCOUNT_DEPOSIT_ADDRESS_MAP = new Map<string, DepositAddress[]>();
const swipftCodeRegexp = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
const ibanRegexp = /^[A-Z]{2}\d{2}[a-zA-Z0-9]{1,30}$/;

export function validateDepositAddressCreationRequest(
  depositAddressRequest: DepositAddressCreationRequest
): void {
  if (!isKnownAsset(depositAddressRequest.transferMethod.asset)) {
    throw new UnknownAdditionalAssetError();
  }
}

export function depositAddressFromDepositAddressRequest(
  depositAddressRequest: DepositAddressCreationRequest
): DepositAddress {
  const { transferMethod } = depositAddressRequest;
  const status = DepositAddressStatus.ENABLED;
  const id = randomUUID();
  let destination: DepositDestination;

  switch (transferMethod.transferMethod) {
    case IbanCapability.transferMethod.IBAN:
      destination = {
        ...transferMethod,
        accountHolder: { name: randomUUID() },
        iban: new RandExp(ibanRegexp).gen(),
      };
      break;
    case SwiftCapability.transferMethod.SWIFT:
      destination = {
        ...transferMethod,
        accountHolder: { name: randomUUID() },
        swiftCode: new RandExp(swipftCodeRegexp).gen(),
        routingNumber: randomUUID(),
      };
      break;
    case PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN:
      destination = {
        ...transferMethod,
        address: randomUUID(),
      };
      break;
    default:
      throw new Error(`Unknown deposit address transfer method: ${transferMethod.transferMethod}`);
  }

  return { id, status, destination };
}

export function addNewDepositAddressForAccount(
  accountId: string,
  depositAddress: DepositAddress,
  accountDepositAddressesMap: Map<string, DepositAddress[]> = ACCOUNT_DEPOSIT_ADDRESS_MAP
): void {
  const accountDepositAddresses = accountDepositAddressesMap.get(accountId) ?? [];
  accountDepositAddresses.push(depositAddress);

  accountDepositAddressesMap.set(accountId, accountDepositAddresses);
}
