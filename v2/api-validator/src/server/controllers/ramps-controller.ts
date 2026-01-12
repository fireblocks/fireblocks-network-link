import { randomUUID } from 'crypto';
import { JSONSchemaFaker } from 'json-schema-faker';
import _ from 'lodash';
import {
  AchAddress,
  AchCapability,
  BridgeProperties,
  EuropeanSEPAAddress,
  EuropeanSEPACapability,
  FiatAddress,
  FiatCapability,
  IbanAddress,
  IbanCapability,
  LocalBankTransferAddress,
  LocalBankTransferCapability,
  MobileMoneyAddressWithBeneficiaryInfo,
  MobileMoneyCapability,
  OffRampProperties,
  OnRampProperties,
  PixAddress,
  PixCapability,
  PublicBlockchainAddress,
  Ramp,
  RampMethod,
  RampRequest,
  RampStatus,
  SpeiAddress,
  SpeiCapability,
  WireAddress,
  WireCapability,
} from '../../client/generated';
import { XComError } from '../../error';
import { fakeSchemaObject } from '../../schemas';
import { AssetsController } from './assets-controller';
import { Repository } from './repository';
import { UnknownAssetError } from './withdrawal-controller';

const RAMPS_COUNT = 10;
const RAMP_CAPABILITIES_COUNT = 10;
type Order = 'asc' | 'desc';

export class RampNotFoundError extends XComError {
  constructor() {
    super('Ramp not found');
  }
}

export class UnsupportedRampMethod extends XComError {
  constructor() {
    super('Unsupported ramp method');
  }
}

export class RampsController {
  private readonly rampsRepository = new Repository<Ramp>();
  private readonly rampMethodRepository = new Repository<RampMethod>();
  private static loadedCapabilities = false;

  constructor() {
    this.loadRampMethods();

    for (let i = 0; i < RAMPS_COUNT; i++) {
      this.rampsRepository.create(fakeSchemaObject('Ramp') as Ramp);
    }

    const knownAssetIds = AssetsController.getAllAdditionalAssets().map((a) => a.id);
    injectKnownAssetIdsToRamps(knownAssetIds, this.rampsRepository);
  }

  private loadRampMethods() {
    const capabilities = RampsController.generateRampMethods();

    this.rampMethodRepository.clear();
    for (const capability of capabilities) {
      this.rampMethodRepository.create(capability);
    }
    const knownAssetIds = AssetsController.getAllAdditionalAssets().map((a) => a.id);
    injectKnownAssetIdsToRampsMethods(knownAssetIds, this.rampMethodRepository);
  }

  private static generateRampMethods() {
    const capabilities: RampMethod[] = [];

    for (let i = 0; i < RAMP_CAPABILITIES_COUNT; i++) {
      capabilities.push(fakeSchemaObject('RampMethod') as RampMethod);
    }

    return capabilities;
  }

  private validateRampRequest(ramp: RampRequest) {
    if (
      !AssetsController.isKnownAsset(ramp.from.asset) ||
      !AssetsController.isKnownAsset(ramp.to.asset)
    ) {
      throw new UnknownAssetError();
    }

    const capability = this.rampMethodRepository.findBy((c) => {
      const rampFrom: any = {
        asset: ramp.from.asset,
      };

      if ('transferMethod' in ramp.from) {
        rampFrom.transferMethod = ramp.from.transferMethod;
      }

      if ('type' in ramp.from) {
        rampFrom.type = ramp.from.type;
      }

      const rampTo: any = {
        asset: ramp.to.asset,
        transferMethod: ramp.to.transferMethod,
      };

      return _.isEqual(c.from, rampFrom) && _.isEqual(c.to, rampTo);
    });
    if (!capability) {
      throw new UnsupportedRampMethod();
    }
  }

  public getRampMethods(): RampMethod[] {
    return this.rampMethodRepository.list();
  }

  public getRamps(order: Order): Ramp[] {
    const ramps = this.rampsRepository.list();
    return _.orderBy(ramps, 'createdAt', order);
  }

  public getRamp(id: string): Ramp {
    const ramp = this.rampsRepository.find(id);
    if (!ramp) {
      throw new RampNotFoundError();
    }
    return ramp;
  }

  public createRamp(ramp: RampRequest): Ramp {
    this.validateRampRequest(ramp);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { idempotencyKey, ...rampProps } = ramp;
    let paymentInstructions;
    let status = RampStatus.PENDING;

    if ('type' in ramp.from && ramp.from.type === 'Prefunded') {
      paymentInstructions = undefined;
      status = RampStatus.PROCESSING;
    } else if (
      ramp.type === OffRampProperties.type.OFF_RAMP ||
      ramp.type === BridgeProperties.type.BRIDGE
    ) {
      paymentInstructions = {
        ...(fakeSchemaObject('PublicBlockchainAddress') as PublicBlockchainAddress),
        asset: ramp.from.asset,
      };
    } else if (ramp.type === OnRampProperties.type.ON_RAMP) {
      const transferMethod = getTransferMethod((ramp.from as FiatCapability)?.transferMethod);
      paymentInstructions = {
        ...transferMethod,
        asset: ramp.from.asset,
      };
    } else {
      throw new XComError('Invalid ramp type', { ramp });
    }

    const newRamp: Ramp = {
      ...rampProps,
      id: randomUUID(),
      paymentInstructions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status,
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    };
    this.rampsRepository.create(newRamp);
    return newRamp;
  }
}

function getTransferMethod(transferMethod: FiatCapability['transferMethod']): FiatAddress {
  switch (transferMethod) {
    case IbanCapability.transferMethod.IBAN:
      return fakeSchemaObject('IbanAddress') as IbanAddress;
    case AchCapability.transferMethod.ACH:
      return fakeSchemaObject('AchAddress') as AchAddress;
    case WireCapability.transferMethod.WIRE:
      return fakeSchemaObject('WireAddress') as WireAddress;
    case SpeiCapability.transferMethod.SPEI:
      return fakeSchemaObject('SpeiAddress') as SpeiAddress;
    case PixCapability.transferMethod.PIX:
      return fakeSchemaObject('PixAddress') as PixAddress;
    case EuropeanSEPACapability.transferMethod.EUROPEAN_SEPA:
      return fakeSchemaObject('EuropeanSEPAAddress') as EuropeanSEPAAddress;
    case LocalBankTransferCapability.transferMethod.LBT:
      return fakeSchemaObject('LocalBankTransferAddress') as LocalBankTransferAddress;
    case MobileMoneyCapability.transferMethod.MOMO:
      return fakeSchemaObject(
        'MobileMoneyAddressWithBeneficiaryInfo'
      ) as MobileMoneyAddressWithBeneficiaryInfo;
    default:
      throw new XComError('Invalid transfer method', { transferMethod });
  }
}

function injectKnownAssetIdsToRampsMethods(
  knownAssetIds: string[],
  repository: Repository<RampMethod>
) {
  for (const { id } of repository.list()) {
    const ramp = repository.find(id);

    if (!ramp) {
      throw new Error('Not possible!');
    }

    if ('assetId' in ramp.from.asset) {
      ramp.from.asset.assetId = JSONSchemaFaker.random.pick(knownAssetIds);
    }
    if ('assetId' in ramp.to.asset) {
      ramp.to.asset.assetId = JSONSchemaFaker.random.pick(knownAssetIds);
    }
  }
}

function injectKnownAssetIdsToRamps(knownAssetIds: string[], repository: Repository<Ramp>) {
  for (const { id } of repository.list()) {
    const ramp = repository.find(id);
    if (!ramp) {
      throw new Error('Not possible!');
    }

    if ('assetId' in ramp.from.asset) {
      ramp.from.asset.assetId = JSONSchemaFaker.random.pick(knownAssetIds);
    }
    if ('assetId' in ramp.to.asset) {
      ramp.to.asset.assetId = JSONSchemaFaker.random.pick(knownAssetIds);
    }

    if (ramp.estimatedFees) {
      for (const fee of ramp.estimatedFees) {
        if ('assetId' in fee.feeAsset) {
          fee.feeAsset.assetId = JSONSchemaFaker.random.pick(knownAssetIds);
        }
      }
    }

    if (ramp.receipt?.actualFees) {
      for (const fee of ramp.receipt.actualFees) {
        if ('assetId' in fee.feeAsset) {
          fee.feeAsset.assetId = JSONSchemaFaker.random.pick(knownAssetIds);
        }
      }
    }
  }
}
