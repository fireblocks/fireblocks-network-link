import { AssetDefinition, NotFoundError } from '../../src/client/generated';
import { MatcherFunction, SyncExpectationResult } from 'expect';
import { SecureClient as Client } from '../../src/client/SecureClient';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface AsymmetricMatchers {
      toBeListedAsset(): void;
    }
    interface Matchers<R> {
      toBeListedAsset(): R;
    }
  }
}

export const toBeListedAsset: MatcherFunction<[assetId: unknown]> = async function (
  assetId: unknown
): Promise<SyncExpectationResult> {
  const NOT_FOUND_RESULT: SyncExpectationResult = {
    pass: false,
    message: () => `asset with id ${this.utils.printReceived(assetId)} is not listed by server`,
  };
  const FOUND_RESULT: SyncExpectationResult = {
    pass: true,
    message: () => `asset with id ${this.utils.printReceived(assetId)} is listed by server`,
  };
  const SERVER_ERROR_RESULT: SyncExpectationResult = {
    pass: false,
    message: () => 'error fetching asset from server',
  };

  if (typeof assetId !== 'string') {
    return {
      pass: false,
      message: () => 'Expected value must be of type string',
    };
  }

  try {
    const client = new Client();
    const asset = (await client.capabilities.getAssetDetails({ id: assetId })) as AssetDefinition;
    if (!asset || asset.id !== assetId) {
      return NOT_FOUND_RESULT;
    } else {
      return FOUND_RESULT;
    }
  } catch (err) {
    if ((err as any).body?.errorType === NotFoundError.errorType.NOT_FOUND) {
      return NOT_FOUND_RESULT;
    } else {
      return SERVER_ERROR_RESULT;
    }
  }
};
