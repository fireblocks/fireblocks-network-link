import Client from '../../src/client';
import { getAllCapableAccountIds, hasCapability } from '../utils/capable-accounts';
import { AssetsDirectory } from '../utils/assets-directory';
import { AssetReference, Ramp, RampMethod } from '../../src/client/generated';
import { getResponsePerIdMapping } from '../utils/response-per-id-mapping';

const noRampsCapability = !hasCapability('ramps');
const accountIds = getAllCapableAccountIds('ramps');

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

  describe('Create ramp order', () => {});
});
