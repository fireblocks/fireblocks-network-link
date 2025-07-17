import { randomUUID } from 'crypto';
import { JSONSchemaFaker } from 'json-schema-faker';
import _ from 'lodash';
import {
  BridgeProperties,
  IbanAddress,
  IbanCapability,
  OffRampProperties,
  OnRampProperties,
  PublicBlockchainAddress,
  Ramp,
  RampMethod,
  RampRequest,
  RampStatus,
  SwiftAddress,
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
    injectKnownAssetIdsToRampsAssetObjects(knownAssetIds, this.rampsRepository);
  }

  private loadRampMethods() {
    const capabilities = RampsController.generateRampMethods();

    this.rampMethodRepository.clear();
    for (const capability of capabilities) {
      this.rampMethodRepository.create(capability);
    }
    const knownAssetIds = AssetsController.getAllAdditionalAssets().map((a) => a.id);
    injectKnownAssetIdsToRampsAssetObjects(knownAssetIds, this.rampMethodRepository);
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

    if (
      ramp.type === OffRampProperties.type.OFF_RAMP ||
      ramp.type === BridgeProperties.type.BRIDGE
    ) {
      paymentInstructions = {
        ...(fakeSchemaObject('PublicBlockchainAddress') as PublicBlockchainAddress),
        asset: ramp.from.asset,
      };
    } else if ('type' in ramp.from && ramp.from.type === 'Prefunded') {
      paymentInstructions = undefined;
    } else if (ramp.type === OnRampProperties.type.ON_RAMP) {
      paymentInstructions = {
        ...((ramp.from as IbanCapability)?.transferMethod === IbanCapability.transferMethod.IBAN
          ? (fakeSchemaObject('IbanAddress') as IbanAddress)
          : (fakeSchemaObject('SwiftAddress') as SwiftAddress)),
        asset: ramp.from.asset,
      };
    } else {
      throw new XComError('Invalid ramp type', { ramp });
    }

    const newRamp: Ramp = {
      ...rampProps,
      id: randomUUID(),
      ...(paymentInstructions && { paymentInstructions }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: RampStatus.PENDING,
      fees: {},
    };
    this.rampsRepository.create(newRamp);
    return newRamp;
  }
}

function injectKnownAssetIdsToRampsAssetObjects(
  knownAssetIds: string[],
  repository: Repository<Ramp> | Repository<RampMethod>
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
