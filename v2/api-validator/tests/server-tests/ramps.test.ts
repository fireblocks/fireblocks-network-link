import Client from '../../src/client';
import { getAllCapableAccountIds, hasCapability } from '../utils/capable-accounts';
import { AssetsDirectory } from '../utils/assets-directory';
import {
  Ramp,
  AssetReference,
  BridgeProperties,
  FiatCapability,
  IbanCapability,
  OffRampProperties,
  OnRampProperties,
  PublicBlockchainCapability,
  RampMethod,
  RampRequest,
  SwiftCapability,
  CommonRamp,
  ApiError,
  BadRequestError,
  RequestPart,
} from '../../src/client/generated';
import { getResponsePerIdMapping } from '../utils/response-per-id-mapping';
import { randomUUID } from 'crypto';

const noRampsCapability = !hasCapability('ramps');
const accountIds = getAllCapableAccountIds('ramps');

function isBlockchainMethod(
  capability: FiatCapability | PublicBlockchainCapability
): capability is PublicBlockchainCapability {
  return capability.transferMethod === PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN;
}

function isFiatMethod(
  capability: FiatCapability | PublicBlockchainCapability
): capability is FiatCapability {
  return (
    capability.transferMethod === FiatCapability.transferMethod.IBAN ||
    capability.transferMethod === FiatCapability.transferMethod.SWIFT
  );
}

function rampRequestFromMethod(method: RampMethod): RampRequest {
  if (isBlockchainMethod(method.from) && isBlockchainMethod(method.to)) {
    return {
      idempotencyKey: randomUUID(),
      type: BridgeProperties.type.BRIDGE,
      from: method.from,
      to: method.to,
      amount: '0.1',
      recipient: {
        asset: method.to.asset,
        transferMethod: method.to.transferMethod,
        address: '0x123',
      },
    };
  }

  if (isFiatMethod(method.from) && isBlockchainMethod(method.to)) {
    return {
      idempotencyKey: randomUUID(),
      type: OnRampProperties.type.ON_RAMP,
      from: method.from,
      to: method.to,
      amount: '0.1',
      recipient: {
        asset: method.to.asset,
        transferMethod: method.to.transferMethod,
        address: '0x123',
      },
    };
  }

  if (isBlockchainMethod(method.from) && isFiatMethod(method.to)) {
    return {
      idempotencyKey: randomUUID(),
      type: OffRampProperties.type.OFF_RAMP,
      from: method.from,
      to: method.to,
      amount: '0.1',
      recipient: {
        asset: method.to.asset,
        accountHolder: {
          name: 'John Doe',
        },
        ...(method.to.transferMethod === FiatCapability.transferMethod.IBAN
          ? {
              transferMethod: IbanCapability.transferMethod.IBAN,
              iban: 'DE89370400440532013000',
            }
          : {
              transferMethod: SwiftCapability.transferMethod.SWIFT,
              swift: 'DEUTDEFF',
              swiftCode: 'DEUTDEFFXXX',
              routingNumber: '123456789',
            }),
      },
    };
  }

  throw new Error('Unsupported method combination');
}

describe.skipIf(noRampsCapability)('Ramps', () => {
  let client: Client;
  let assets: AssetsDirectory;
  let rampCapabilitiesMap: Map<string, RampMethod[]>;

  let isKnownAsset: (assetId: AssetReference) => boolean;

  const getRampsCapabilities = async (accountId, limit, startingAfter?) => {
    const response = await client.capabilities.getRampMethods({
      accountId,
      limit,
      startingAfter,
    });
    return response.capabilities;
  };

  beforeAll(async () => {
    client = new Client();
    assets = await AssetsDirectory.fetch();
    isKnownAsset = assets.isKnownAsset.bind(assets);
    rampCapabilitiesMap = await getResponsePerIdMapping(getRampsCapabilities, accountIds);
  });

  describe('Capabilities', () => {
    it('should return only known assets in response', () => {
      for (const capabilities of rampCapabilitiesMap.values()) {
        for (const capability of capabilities) {
          expect(capability.from.asset).toSatisfy(isKnownAsset);
          expect(capability.to.asset).toSatisfy(isKnownAsset);
        }
      }
    });

    it('should return at least one capability per account', () => {
      for (const capabilities of rampCapabilitiesMap.values()) {
        expect(capabilities.length).toBeGreaterThan(0);
      }
    });

    it('should return unique capabilities per account', () => {
      const hasDuplicatesCapability = (capabilities: RampMethod[]) => {
        const seen = new Set<string>();
        for (const item of capabilities) {
          const key = JSON.stringify({ from: item.from, to: item.to });
          if (seen.has(key)) {
            return true;
          }
          seen.add(key);
        }
        return false;
      };

      for (const capabilities of rampCapabilitiesMap.values()) {
        const uniqueCapabilities = new Set(capabilities.map((capability) => capability.id));
        expect(hasDuplicatesCapability(capabilities)).toBeFalsy();
        expect(uniqueCapabilities.size).toEqual(capabilities.length);
      }
    });
  });

  describe('Get ramps', () => {
    let accountRampsMap: Map<string, Ramp[]>;

    const getRamps = async (accountId, limit, startingAfter?) => {
      const response = await client.ramps.getRamps({
        accountId,
        limit,
        startingAfter,
      });
      return response.ramps;
    };

    beforeAll(async () => {
      accountRampsMap = await getResponsePerIdMapping(getRamps, accountIds);
    });

    it('should be sorted by creation date in desc order', () => {
      const isSortedByDescendingCreationTime = (ramps: Ramp[]) => {
        const withdrawalsCreationTimes = ramps.map((ramp) => ramp.createdAt);
        return (
          JSON.stringify(withdrawalsCreationTimes) ==
          JSON.stringify(withdrawalsCreationTimes.sort((a, b) => (a <= b ? 1 : -1)))
        );
      };

      for (const ramps of accountRampsMap.values()) {
        expect(ramps).toSatisfy(isSortedByDescendingCreationTime);
      }
    });

    it('should find every listed ramp get ramp details endpoint', async () => {
      for (const [accountId, ramps] of accountRampsMap.entries()) {
        for (const ramp of ramps) {
          const response = await client.ramps.getRampDetails({
            accountId,
            id: ramp.id,
          });
          expect(response).toEqual(ramp);
        }
      }
    });

    it('should use know assets only', () => {
      for (const ramps of accountRampsMap.values()) {
        for (const ramp of ramps) {
          expect(ramp.from.asset).toSatisfy(isKnownAsset);
          expect(ramp.to.asset).toSatisfy(isKnownAsset);
        }
      }
    });
  });

  describe('Create ramp', () => {
    const accountId = accountIds[0];
    let capability: RampMethod;

    const getCreateRampFailureResult = async (requestBody: RampRequest): Promise<ApiError> => {
      try {
        await client.ramps.createRamp({ accountId, requestBody });
      } catch (err) {
        if (err instanceof ApiError) {
          return err;
        }
        throw err;
      }
      throw new Error('Expected to throw');
    };

    beforeAll(() => {
      const firstCapability = rampCapabilitiesMap.get(accountId)?.[0];

      if (!firstCapability) {
        expect.fail('Must return at least one capability');
        return;
      }

      capability = firstCapability;
    });

    describe('Successful Creation', () => {
      let createdRamp: Ramp;

      beforeAll(async () => {
        try {
          createdRamp = await client.ramps.createRamp({
            accountId,
            requestBody: rampRequestFromMethod(capability),
          });
        } catch (err) {
          console.log(JSON.stringify(err));
          throw err;
        }
      });

      it('should have matching from and to assets and rails', async () => {
        expect(createdRamp.from).toEqual(capability.from);
        expect(createdRamp.to).toEqual(capability.to);
      });

      it('should receive delivery instructions matching the from asset and rail', async () => {
        expect(createdRamp.deliveryInstructions.transferMethod).toEqual(
          capability.from.transferMethod
        );
        expect(createdRamp.deliveryInstructions.asset).toEqual(capability.from.asset);
      });

      it('should receive initial status CREATED', async () => {
        expect(createdRamp.status).toBeOneOf([
          CommonRamp.status.CREATED,
          CommonRamp.status.PENDING_DELIVERY,
        ]);
      });

      it('should find ramp in details endpoint', async () => {
        const response = await client.ramps.getRampDetails({
          accountId,
          id: createdRamp.id,
        });
        expect(response).toEqual(createdRamp);
      });
    });

    describe('Invalid Creation', () => {
      it('should fail when invalid asset is used', async () => {
        const invalidAsset = { assetId: randomUUID() };
        const requestBody = rampRequestFromMethod({
          from: {
            asset: invalidAsset,
            transferMethod: PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN,
          },
          to: {
            asset: invalidAsset,
            transferMethod: PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN,
          },
          id: randomUUID(),
        });

        const error = await getCreateRampFailureResult(requestBody);

        expect(error.status).toBe(400);
        expect(error.body.errorType).toBe(BadRequestError.errorType.UNKNOWN_ASSET);
        expect(error.body.requestPart).toBe(RequestPart.BODY);
      });

      it('should fail when invalid transfer method is used', async () => {
        const blockchainMethod: PublicBlockchainCapability = isBlockchainMethod(capability.from)
          ? capability.from
          : (capability.to as PublicBlockchainCapability);
        const requestBody = rampRequestFromMethod({
          from: blockchainMethod,
          to: blockchainMethod,
          id: randomUUID(),
        });

        const error = await getCreateRampFailureResult(requestBody);

        expect(error.status).toBe(400);
        expect(error.body.errorType).toBe(BadRequestError.errorType.UNSUPPORTED_RAMP_METHOD);
        expect(error.body.requestPart).toBe(RequestPart.BODY);
      });
    });

    describe('Idempotency', () => {
      let rampRequest: RampRequest;
      let rampResponse: Ramp;
      beforeAll(async () => {
        rampRequest = rampRequestFromMethod(capability);
        rampResponse = await client.ramps.createRamp({ accountId, requestBody: rampRequest });
      });

      it('should return same response when using the same idempotency key', async () => {
        const idempotentResponse = await client.ramps.createRamp({
          accountId,
          requestBody: rampRequest,
        });
        expect(idempotentResponse).toEqual(rampResponse);
      });

      it('should return idempotency key reuse error when using used key for different request', async () => {
        const invalidRequest: RampRequest = { ...rampRequest, amount: '0.2' };
        const idempotencyKeyReuseResponse = await getCreateRampFailureResult(invalidRequest);

        expect(idempotencyKeyReuseResponse.status).toBe(400);
        expect(idempotencyKeyReuseResponse.body.errorType).toBe(
          BadRequestError.errorType.IDEMPOTENCY_KEY_REUSE
        );
      });
    });
  });
});
