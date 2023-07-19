import Client from '../src/client';
import { AssetDefinition, Capabilities } from '../src/client/generated';

const KNWON_API_VERSIONS = ['0.0.1'];

describe('Capabilities', () => {
  let client: Client;

  beforeAll(() => {
    client = new Client();
  });

  describe('/capabilities', () => {
    const capabilitiesConfig: Capabilities = global.capabilities;
    let capabilitiesResponse: Capabilities;

    beforeAll(async () => {
      capabilitiesResponse = (await client.capabilities.getCapabilities({})) as Capabilities;
    });

    it('should match config capabilities', () => {
      expect(capabilitiesResponse).toEqual(capabilitiesConfig);
    });

    it('should include a valid api version', () => {
      expect(isValidApiVersion(capabilitiesConfig.version)).toBe(true);
    });
  });

  describe('/capabilities/assets', () => {
    let result: { assets: AssetDefinition[] };

    beforeAll(async () => {
      result = (await client.capabilities.getAdditionalAssets({})) as { assets: AssetDefinition[] };
    });

    it('should return list of assets', () => {
      expect(result.assets).toBeDefined();
    });
  });
});

function isValidApiVersion(apiVersion: string) {
  return KNWON_API_VERSIONS.includes(apiVersion);
}
