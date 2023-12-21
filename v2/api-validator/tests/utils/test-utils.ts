import { ApiError } from '../../src/client/generated';

export async function getFailureResult<A>(request: () => A): Promise<ApiError> {
  try {
    await request();
  } catch (err) {
    if (err instanceof ApiError) {
      return err;
    }
    throw err;
  }
  throw new Error('Expected to throw');
}
