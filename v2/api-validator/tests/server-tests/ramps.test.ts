import { randomUUID } from 'crypto';
import Client from '../../src/client';
import {
  AchCapability,
  ApiError,
  AssetReference,
  BadRequestError,
  BridgeProperties,
  CountryAlpha2Code,
  FiatCapability,
  FullName,
  IbanCapability,
  PostalAddress,
  OffRampProperties,
  OnRampProperties,
  OrderQuote,
  ParticipantRelationshipType,
  PersonaIdentificationInfo,
  PrefundedBlockchainCapability,
  PrefundedBridgeProperties,
  PrefundedFiatCapability,
  PrefundedOffRampProperties,
  PrefundedOnRampProperties,
  PublicBlockchainCapability,
  Ramp,
  RampMethod,
  RampRequest,
  RampStatus,
  RequestPart,
  SpeiCapability,
  WireCapability,
  Retry,
  MobileMoneyCapability,
  PixCapability,
  EuropeanSEPACapability,
  LocalBankTransferCapability,
} from '../../src/client/generated';
import config from '../../src/config';
import { AssetsDirectory } from '../utils/assets-directory';
import { getAllCapableAccountIds, hasCapability } from '../utils/capable-accounts';
import { getResponsePerIdMapping } from '../utils/response-per-id-mapping';

const noRampsCapability = !hasCapability('ramps');
const accountIds = getAllCapableAccountIds('ramps');

const blockchainDestinationConfig = config.get('withdrawal.blockchain');
const ibanDestinationConfig = config.get('withdrawal.iban');
const achDestinationConfig = config.get('withdrawal.ach');
const wireDestinationConfig = config.get('withdrawal.wire');
const speiDestinationConfig = config.get('withdrawal.spei');
const pixDestinationConfig = config.get('withdrawal.pix');
const europeanSepaDestinationConfig = config.get('withdrawal.europeanSepa');
const mobileMoneyDestinationConfig = config.get('withdrawal.mobileMoney');
const lbtDestinationConfig = config.get('withdrawal.localBankTransfer');

const rampsAmount = config.get('ramps.amount');

function isBlockchainMethod(
  capability:
    | FiatCapability
    | PublicBlockchainCapability
    | PrefundedFiatCapability
    | PrefundedBlockchainCapability
): capability is PublicBlockchainCapability {
  return (
    'transferMethod' in capability &&
    capability.transferMethod === PublicBlockchainCapability.transferMethod.PUBLIC_BLOCKCHAIN
  );
}

function isFiatMethod(
  capability:
    | FiatCapability
    | PublicBlockchainCapability
    | PrefundedFiatCapability
    | PrefundedBlockchainCapability
): capability is FiatCapability {
  return (
    'transferMethod' in capability &&
    (capability.transferMethod === IbanCapability.transferMethod.IBAN ||
      capability.transferMethod === AchCapability.transferMethod.ACH ||
      capability.transferMethod === WireCapability.transferMethod.WIRE ||
      capability.transferMethod === SpeiCapability.transferMethod.SPEI ||
      capability.transferMethod === PixCapability.transferMethod.PIX ||
      capability.transferMethod === EuropeanSEPACapability.transferMethod.EUROPEAN_SEPA ||
      capability.transferMethod === MobileMoneyCapability.transferMethod.MOMO ||
      capability.transferMethod === LocalBankTransferCapability.transferMethod.LBT)
  );
}

function isPrefundedFiatMethod(
  capability:
    | FiatCapability
    | PublicBlockchainCapability
    | PrefundedFiatCapability
    | PrefundedBlockchainCapability
): capability is PrefundedFiatCapability {
  return (
    'type' in capability &&
    capability.type === 'Prefunded' &&
    'asset' in capability &&
    'nationalCurrencyCode' in capability.asset
  );
}

function isPrefundedBlockchainMethod(
  capability:
    | FiatCapability
    | PublicBlockchainCapability
    | PrefundedFiatCapability
    | PrefundedBlockchainCapability
): capability is PrefundedBlockchainCapability {
  return 'type' in capability && capability.type === 'Prefunded' && 'asset' in capability;
}

function getFiatDestinationConfig(transferMethod: string) {
  switch (transferMethod) {
    case IbanCapability.transferMethod.IBAN:
      return { ...ibanDestinationConfig, transferMethod: IbanCapability.transferMethod.IBAN };
    case AchCapability.transferMethod.ACH:
      return { ...achDestinationConfig, transferMethod: AchCapability.transferMethod.ACH };
    case WireCapability.transferMethod.WIRE:
      return { ...wireDestinationConfig, transferMethod: WireCapability.transferMethod.WIRE };
    case SpeiCapability.transferMethod.SPEI:
      return { ...speiDestinationConfig, transferMethod: SpeiCapability.transferMethod.SPEI };
    case PixCapability.transferMethod.PIX:
      return { ...pixDestinationConfig, transferMethod: PixCapability.transferMethod.PIX };
    case EuropeanSEPACapability.transferMethod.EUROPEAN_SEPA:
      return {
        ...europeanSepaDestinationConfig,
        transferMethod: EuropeanSEPACapability.transferMethod.EUROPEAN_SEPA,
      };
    case MobileMoneyCapability.transferMethod.MOMO:
      return {
        ...mobileMoneyDestinationConfig,
        transferMethod: MobileMoneyCapability.transferMethod.MOMO,
      };
    case LocalBankTransferCapability.transferMethod.LBT:
      return {
        ...lbtDestinationConfig,
        transferMethod: LocalBankTransferCapability.transferMethod.LBT,
      };
    default:
      throw new Error('Unsupported transfer method');
  }
}

function rampRequestFromMethod(method: RampMethod): RampRequest {
  if (isBlockchainMethod(method.from) && isBlockchainMethod(method.to)) {
    return {
      idempotencyKey: randomUUID(),
      type: BridgeProperties.type.BRIDGE,
      from: method.from,
      to: {
        ...method.to,
        ...blockchainDestinationConfig,
      },
      amount: rampsAmount,
    };
  }

  if (isFiatMethod(method.from) && isBlockchainMethod(method.to)) {
    return {
      idempotencyKey: randomUUID(),
      type: OnRampProperties.type.ON_RAMP,
      from: method.from,
      to: {
        ...method.to,
        ...blockchainDestinationConfig,
      },
      amount: rampsAmount,
    };
  }

  if (isBlockchainMethod(method.from) && isFiatMethod(method.to)) {
    return {
      idempotencyKey: randomUUID(),
      type: OffRampProperties.type.OFF_RAMP,
      from: method.from,
      to: {
        ...method.to,
        ...getFiatDestinationConfig(method.to.transferMethod),
      },
      amount: rampsAmount,
    };
  }
  // Prefunded fiat to blockchain on-ramp
  if (isPrefundedFiatMethod(method.from) && isBlockchainMethod(method.to)) {
    return {
      idempotencyKey: randomUUID(),
      type: PrefundedOnRampProperties.type.ON_RAMP,
      from: method.from,
      to: {
        ...method.to,
        ...blockchainDestinationConfig,
      },
      amount: rampsAmount,
    };
  }

  // Prefunded blockchain to fiat off-ramp
  if (isPrefundedBlockchainMethod(method.from) && isFiatMethod(method.to)) {
    return {
      idempotencyKey: randomUUID(),
      type: PrefundedOffRampProperties.type.OFF_RAMP,
      from: method.from,
      to: {
        ...method.to,
        ...getFiatDestinationConfig(method.to.transferMethod),
      },
      amount: rampsAmount,
    };
  }

  // Prefunded blockchain to blockchain bridge
  if (isPrefundedBlockchainMethod(method.from) && isBlockchainMethod(method.to)) {
    return {
      idempotencyKey: randomUUID(),
      type: PrefundedBridgeProperties.type.BRIDGE,
      from: method.from,
      to: {
        ...method.to,
        ...blockchainDestinationConfig,
      },
      amount: rampsAmount,
    };
  }

  throw new Error('Unsupported method combination' + JSON.stringify(method));
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

    it('should find every listed ramp with get-ramp-details endpoint', async () => {
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

    it('should use known assets only', () => {
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
        expect(createdRamp.to.asset).toEqual(capability.to.asset);
        expect(createdRamp.to.transferMethod).toEqual(capability.to.transferMethod);
      });

      it('should receive delivery instructions matching the from asset and rail for non-prefunded ramps', async () => {
        if ('type' in capability.from && capability.from.type === 'Prefunded') {
          return;
        }
        expect(
          'paymentInstructions' in createdRamp && createdRamp.paymentInstructions.transferMethod
        ).toEqual(capability.from.transferMethod);
        expect(
          'paymentInstructions' in createdRamp && createdRamp.paymentInstructions.asset
        ).toEqual(capability.from.asset);
      });

      it('should receive initial status based on the ramp type', async () => {
        const isPrefunded =
          'type' in capability.from &&
          capability.from.type === PrefundedFiatCapability.type.PREFUNDED;
        if (isPrefunded) {
          expect(createdRamp.status).toBe(RampStatus.PROCESSING);
        } else {
          expect(createdRamp.status).toBe(RampStatus.PENDING);
        }
      });

      it('should find ramp in details endpoint', async () => {
        const response = await client.ramps.getRampDetails({
          accountId,
          id: createdRamp.id,
        });
        expect(response).toEqual(createdRamp);
      });

      it('should accept ramp request with quote', async () => {
        const requestWithQuote: RampRequest = {
          ...rampRequestFromMethod(capability),
          idempotencyKey: randomUUID(),
          executionDetails: {
            type: OrderQuote.type.QUOTE,
            quoteId: 'test-quote-' + randomUUID(),
            reQuote: {
              type: Retry.type.RETRY,
              slippage: 0.01,
              count: 3,
            },
          },
        };

        const response = await client.ramps.createRamp({
          accountId,
          requestBody: requestWithQuote,
        });

        expect(response.executionDetails).toBeDefined();
        if (response.executionDetails?.type === OrderQuote.type.QUOTE) {
          expect(response.executionDetails.quoteId).toBe(
            (requestWithQuote.executionDetails as OrderQuote)?.quoteId
          );
        } else {
          fail('executionDetails should be of type Quote');
        }
      });

      it('should accept ramp request with participant identification', async () => {
        const fullName: FullName = { firstName: 'John', lastName: 'Doe' };

        const postalAddress: PostalAddress = {
          streetName: 'Main St',
          buildingNumber: '101',
          postalCode: '54321',
          city: 'Los Angeles',
          subdivision: 'CA',
          district: 'La La Land',
          country: CountryAlpha2Code.US,
        };

        const requestWithKYC: RampRequest = {
          ...rampRequestFromMethod(capability),
          idempotencyKey: randomUUID(),
          participantsIdentification: {
            originator: {
              externalReferenceId: 'externalReferenceId',
              participantRelationshipType: ParticipantRelationshipType.FIRST_PARTY,
              entityType: PersonaIdentificationInfo.entityType.INDIVIDUAL,
              fullName,
              dateOfBirth: '1985-05-10',
              postalAddress,
            },
            beneficiary: {
              externalReferenceId: 'externalReferenceId',
              participantRelationshipType: ParticipantRelationshipType.FIRST_PARTY,
              entityType: PersonaIdentificationInfo.entityType.INDIVIDUAL,
              fullName,
              dateOfBirth: '1985-05-10',
              postalAddress,
            },
          },
        };

        const response = await client.ramps.createRamp({
          accountId,
          requestBody: requestWithKYC,
        });

        expect(response).toBeDefined();
      });

      it('should send expiresAt in response', async () => {
        const response = await client.ramps.getRampDetails({
          accountId,
          id: createdRamp.id,
        });
        expect(response.expiresAt).toBeDefined();
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
