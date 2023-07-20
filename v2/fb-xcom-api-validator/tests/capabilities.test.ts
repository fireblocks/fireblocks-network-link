import { randomUUID } from 'crypto';
import Client from '../src/client';
import { ApiError, AssetDefinition, Capabilities, NotFoundError } from '../src/client/generated';

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

    describe('Interaction with /capabilities/assets/:id', () => {
      it('should find each listed asset on asset details endpoint', async () => {
        for (const asset of result.assets) {
          await expect(asset.id).toBeListedAsset();
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
        expect(apiError.body.errorType).toBe(NotFoundError.errorType.NOT_FOUND);
      });
    });
  });
});

function isValidApiVersion(apiVersion: string) {
  return KNWON_API_VERSIONS.includes(apiVersion);
}
