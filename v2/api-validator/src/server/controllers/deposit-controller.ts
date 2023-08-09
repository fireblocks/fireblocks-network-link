import _ from 'lodash';
import RandExp from 'randexp';
import { randomUUID } from 'crypto';
import { JsonValue } from 'type-fest';
import { XComError } from '../../error';
import {
  assetsController,
  SUPPORTED_ASSETS,
  UnknownAdditionalAssetError,
} from './assets-controller';
import {
  CrossAccountTransferCapability,
  Deposit,
  DepositAddress,
  DepositAddressCreationRequest,
  DepositAddressStatus,
  DepositCapability,
  DepositDestination,
  DepositStatus,
  IbanCapability,
  Layer1Cryptocurrency,
  Layer2Cryptocurrency,
  NationalCurrencyCode,
  PublicBlockchainCapability,
  SwiftCapability,
} from '../../client/generated';
import { Repository } from './repository';
import { accountsController } from './accounts-controller';

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

export const DEPOSITS: Deposit[] = [
  {
    balanceAmount: '1',
    balanceAsset: { nationalCurrencyCode: NationalCurrencyCode.MXN },
    createdAt: '2021-12-10T14:44:14.490Z',
    id: '6f6ee0cf-22ff-43ab-b094-f2d274c965e2',
    source: {
      accountHolder: { name: 'John Doe' },
      amount: '1',
      asset: { nationalCurrencyCode: NationalCurrencyCode.MXN },
      transferMethod: IbanCapability.transferMethod.IBAN,
      iban: 'DG31Rp5gPECjVZKX6Mu935eiSBE',
    },
    status: DepositStatus.PENDING,
  },
  {
    balanceAmount: '153',
    balanceAsset: { cryptocurrencySymbol: Layer1Cryptocurrency.BTC },
    createdAt: '2023-08-02T14:42:08.828Z',
    id: '8849872b-8e5c-4906-8f05-3889909aaa1b',
    source: {
      asset: { cryptocurrencySymbol: Layer2Cryptocurrency.ARB },
      transferMethod: PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN,
      amount: '999',
      address: '0x91b9e7bc95f8ef6f4e08ea10aaaac84b6c54203b',
    },
    status: DepositStatus.SUCCEEDED,
  },
  {
    balanceAmount: '1000',
    balanceAsset: { assetId: SUPPORTED_ASSETS[0].id },
    createdAt: '2023-08-01T14:43:19.646Z',
    id: 'fcde2693-1e51-4dc4-9234-4a2cc8cf191e',
    source: {
      asset: { assetId: SUPPORTED_ASSETS[0].id },
      transferMethod: PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN,
      amount: '1000',
      address: '42acace8-b21f-4ab8-b84c-7aa091315c9a',
    },
    status: DepositStatus.FAILED,
  },
  {
    balanceAmount: '255',
    balanceAsset: { nationalCurrencyCode: NationalCurrencyCode.USD },
    createdAt: '2023-06-03T14:43:52.752Z',
    id: '5c3065a0-a678-486b-ba13-9453e8ba3d74',
    source: {
      asset: { nationalCurrencyCode: NationalCurrencyCode.USD },
      transferMethod: SwiftCapability.transferMethod.SWIFT,
      accountHolder: { name: 'Jane Doe' },
      routingNumber: '7879c1f0-9a64-4b7f-b775-7e51f55573b1',
      swiftCode: 'PLZMDQA1623',
      amount: '255',
    },
    status: DepositStatus.SUCCEEDED,
  },
];

export class DepositAddressNotFoundError extends XComError {
  constructor() {
    super('Deposit address not found');
  }
}

export class DepositNotFoundError extends XComError {
  constructor() {
    super('Deposit not found');
  }
}

export class DepositAddressDisabledError extends XComError {
  constructor(id: string) {
    super('Deposit address is disabled', { id });
  }
}

type AccountDeposit = { id: string; accountId: string; data: Deposit };
type AccountDepositAddress = { id: string; accountId: string; data: DepositAddress };

export class DepositController {
  private readonly depositRepository = new Repository<AccountDeposit>();
  private readonly depositAddressRepository = new Repository<AccountDepositAddress>();
  private readonly swiftCodeRegexp = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
  private readonly ibanRegexp = /^[A-Z]{2}\d{2}[a-zA-Z0-9]{1,30}$/;

  constructor(deposits: Deposit[]) {
    for (const { id: accountId } of accountsController.getAllSubAccounts()) {
      for (const deposit of deposits) {
        this.depositRepository.create({ id: deposit.id, accountId, data: deposit });
      }
    }
  }

  public getAllDeposits(accountId: string): Deposit[] {
    const deposits = this.depositRepository.list();
    const depositsForAccount = deposits.filter((d) => d.accountId === accountId);
    return depositsForAccount.map((d) => d.data);
  }

  public getDeposit(accountId: string, depositId: string): Deposit {
    const accountDeposit = this.depositRepository.find(depositId);

    if (!accountDeposit || accountDeposit.accountId !== accountId) {
      throw new DepositNotFoundError();
    }

    return accountDeposit.data;
  }

  public validateDepositAddressCreationRequest(
    depositAddressRequest: DepositAddressCreationRequest
  ): void {
    if (!assetsController.isKnownAsset(depositAddressRequest.transferMethod.asset)) {
      throw new UnknownAdditionalAssetError();
    }
  }

  public depositAddressFromDepositAddressRequest(
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
          iban: new RandExp(this.ibanRegexp).gen(),
        };
        break;
      case SwiftCapability.transferMethod.SWIFT:
        destination = {
          ...transferMethod,
          accountHolder: { name: randomUUID() },
          swiftCode: new RandExp(this.swiftCodeRegexp).gen(),
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
        throw new Error(
          `Unknown deposit address transfer method: ${transferMethod.transferMethod}`
        );
    }

    return { id, status, destination };
  }

  public addNewDepositAddressForAccount(accountId: string, depositAddress: DepositAddress): void {
    this.depositAddressRepository.create({
      id: depositAddress.id,
      accountId,
      data: depositAddress,
    });
  }

  public getAccountDepositAddresses(accountId: string): DepositAddress[] {
    const depositAddresses = this.depositAddressRepository.list();
    const depositAddressesForAccount = depositAddresses.filter(
      (depositAddress) => depositAddress.accountId === accountId
    );
    return depositAddressesForAccount.map((da) => da.data);
  }

  public getAccountDepositAddress(accountId: string, depositAddressId: string): DepositAddress {
    const accountDepositAddress = this.depositAddressRepository.find(depositAddressId);

    if (!accountDepositAddress || accountDepositAddress.accountId !== accountId) {
      throw new DepositAddressNotFoundError();
    }

    return accountDepositAddress.data;
  }

  public disableAccountDepositAddress(accountId: string, depositAddressId: string): DepositAddress {
    const accountDepositAddress = this.depositAddressRepository.find(depositAddressId);

    if (!accountDepositAddress || accountDepositAddress.accountId !== accountId) {
      throw new DepositAddressNotFoundError();
    }

    if (accountDepositAddress.data.status === DepositAddressStatus.DISABLED) {
      throw new DepositAddressDisabledError(depositAddressId);
    }

    accountDepositAddress.data.status = DepositAddressStatus.DISABLED;

    return accountDepositAddress.data;
  }
}

export const depositController = new DepositController(DEPOSITS);
