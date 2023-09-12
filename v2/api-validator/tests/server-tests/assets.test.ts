import ApiClient from '../../src/client';
import { ApiError, AssetDefinition, GeneralError } from '../../src/client/generated';

describe('Assets', () => {
  const client = new ApiClient();

  describe('/capabilities/assets', () => {
    let result: { assets: AssetDefinition[] };

    beforeAll(async () => {
      result = await client.capabilities.getAdditionalAssets({});
    });

    describe('Interaction with /capabilities/assets/:id', () => {
      const isListedAsset = async (assetId: string): Promise<boolean> => {
        try {
          const asset = await client.capabilities.getAssetDetails({ id: assetId });
          return asset?.id === assetId;
        } catch (err) {
          if (err instanceof ApiError && err.body?.errorType === GeneralError.errorType.NOT_FOUND) {
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
});
