import { randomUUID } from 'crypto';
import Client from '../src/client';
import { ApiError, AssetDefinition, Capabilities, ErrorType } from '../src/client/generated';
import config from '../src/config';

const KNWON_API_VERSIONS = ['0.0.1'];

describe('Capabilities', () => {
  let client: Client;

  beforeAll(() => {
    client = new Client();
  });

  describe('/capabilities', () => {
    const capabilitiesConfig: Capabilities = config.get('capabilities');
    let capabilitiesResponse: Capabilities;

    beforeAll(async () => {
      capabilitiesResponse = (await client.capabilities.getCapabilities({})) as Capabilities;
    });

    it('should match config capabilities', () => {
      expect(capabilitiesResponse).toEqual(capabilitiesConfig);
    });

    it('should include a known api version', () => {
      expect(isKnownApiVersion(capabilitiesConfig.version)).toBe(true);
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

    describe('Interaction with /capabilities/assets/:id', () => {
      const isListedAsset = async (assetId: string): Promise<boolean> => {
        try {
          const asset = (await client.capabilities.getAssetDetails({
            id: assetId,
          })) as AssetDefinition;
          if (!asset || asset.id !== assetId) {
            return false;
          }
          return true;
        } catch (err) {
          if ((err as any).body?.errorType === ErrorType.NOT_FOUND) {
            return false;
          }
          throw err;
        }
      };

      it('should find each listed asset on asset details endpoint', async () => {
        for (const asset of result.assets) {
          const found = await isListedAsset(asset.id);
          expect(found).toBe(true);
        }
      });
    });
  });

  describe('/capabilities/assets/:id', () => {
    const unsupportedAssetId = randomUUID();

    describe('Requesting unsupported asset', () => {
      let apiError: ApiError;
      const fetchUnsupportedAsset = async () => {
        try {
          await client.capabilities.getAssetDetails({ id: unsupportedAssetId });
        } catch (err) {
          if (err instanceof ApiError) {
            return err;
          }
          throw err;
        }
        throw new Error('Expected to throw');
      };

      beforeAll(async () => {
        apiError = await fetchUnsupportedAsset();
      });

      it('should respond with HTTP response code 404 (Not Found)', () => {
        expect(apiError.status).toBe(404);
      });

      it('should respond with the correct error type in the response body', () => {
        expect(apiError.body.errorType).toBe(ErrorType.NOT_FOUND);
      });
    });
  });
});

function isKnownApiVersion(apiVersion: string) {
  return KNWON_API_VERSIONS.includes(apiVersion);
}
