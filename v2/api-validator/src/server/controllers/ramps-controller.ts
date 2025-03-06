import { JSONSchemaFaker } from 'json-schema-faker';
import _ from 'lodash';
import { fakeSchemaObject } from '../../schemas';
import { AssetsController } from './assets-controller';
import { Repository } from './repository';
import {
  BridgeProperties,
  CommonRamp,
  FiatCapability,
  IbanAddress,
  OffRampProperties,
  OffRampTransfer,
  OnRampProperties,
  OnRampTransfer,
  PublicBlockchainAddress,
  Ramp,
  RampMethod,
  RampRequest,
  SwiftAddress,
} from '../../client/generated';
import { randomUUID } from 'crypto';
import { XComError } from '../../error';

const RAMPS_COUNT = 10;
const RAMP_CAPABILITIES_COUNT = 5;
type Order = 'asc' | 'desc';

export class RampNotFoundError extends XComError {
  constructor() {
    super('Ramp not found');
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
    if (
      ramp.type === OffRampProperties.type.OFF_RAMP ||
      ramp.type === BridgeProperties.type.BRIDGE
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { idempotencyKey, ...rampProps } = ramp;
      const deliveryInstructions: OffRampTransfer['deliveryInstructions'] = fakeSchemaObject(
        'PublicBlockchainAddress'
      ) as PublicBlockchainAddress;
      const newRamp: Ramp = {
        ...rampProps,
        id: randomUUID(),
        deliveryInstructions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: CommonRamp.status.CREATED,
      };
      this.rampsRepository.create(newRamp);
      return newRamp;
    }
    if (ramp.type === OnRampProperties.type.ON_RAMP) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { idempotencyKey, ...rampProps } = ramp;
      const deliveryInstructions: OnRampTransfer['deliveryInstructions'] = {
        ...(ramp.from.transferMethod === FiatCapability.transferMethod.IBAN
          ? (fakeSchemaObject('IbanAddress') as IbanAddress)
          : (fakeSchemaObject('SwiftAddress') as SwiftAddress)),
        asset: ramp.from.asset,
      };
      const newRamp: Ramp = {
        ...rampProps,
        id: randomUUID(),
        deliveryInstructions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: CommonRamp.status.CREATED,
      };
      this.rampsRepository.create(newRamp);
      return newRamp;
    }
    throw new XComError('Invalid ramp type', { ramp });
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
