import { JSONSchemaFaker } from 'json-schema-faker';
import _ from 'lodash';
import { Ramp, RampMethod } from '../../client/generated';
import { fakeSchemaObject } from '../../schemas';
import { AssetsController } from './assets-controller';
import { Repository } from './repository';
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
