import { JsonValue } from 'type-fest';
import { fakeObject } from '../faker';
import Client from '../../src/client';
import { ApiError, ErrorType } from '../../src/client/generated';
import { OpenApiOperationDetails } from '../../src/server/schema';

describe('Not Found tests', () => {
  describe.each(getParamEndpoints())('$method $url', ({ operationId, schema }) => {
    let apiError: ApiError;

    const requestNonExistingResource = async () => {
      const client = new Client();
      const operationFunction = client[schema.tags[0]]?.[operationId].bind(client);

      const params = fakeObject(schema.params);
      const querystring = fakeObject(schema.querystring);

      try {
        await operationFunction({ ...params, ...querystring });
      } catch (err) {
        if (err instanceof ApiError) {
          return err;
        }
        throw err;
      }
      throw new Error('Expected to throw');
    };

    beforeAll(async () => {
      apiError = await requestNonExistingResource();
    });

    it('should respond with HTTP response code 404 (Not Found)', () => {
      expect(apiError.status).toBe(404);
    });

    it('should respond with the correct error type in the response body', () => {
      expect(apiError.body.errorType).toBe(ErrorType.NOT_FOUND);
      expect(apiError.body.message).toBeDefined();
    });
  });
});

function getParamEndpoints() {
  const supportedOpenApiEndpoints: OpenApiOperationDetails[] = global.supportedOpenApiEndpoints;
  return supportedOpenApiEndpoints.filter(
    (endpoint) => !!endpoint.schema.params && endpoint.method !== 'POST'
  );
}
