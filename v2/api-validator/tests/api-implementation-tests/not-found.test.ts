import { JsonValue } from 'type-fest';
import { fakeObject } from '../faker';
import Client from '../../src/client';
import { OpenApiOperationDetails } from '../../src/server/schema';
import { ApiError, GeneralError } from '../../src/client/generated';
import { randomUUID } from 'crypto';

describe('Not Found tests', () => {
  describe.each(getParamEndpoints())('$method $url', ({ method, operationId, schema }) => {
    let apiError: ApiError;

    const requestNonExistingResource = async () => {
      const client = new Client();
      const operationFunction = client[schema.tags[0]]?.[operationId].bind(client);

      const params = fakeObject(schema.params);
      if (params?.id) {
        params.id = randomUUID();
      }
      if (params?.accountId) {
        params.accountId = randomUUID();
      }

      const querystring = fakeObject(schema.querystring);

      let requestBody: JsonValue | undefined = undefined;
      if (method === 'POST') {
        requestBody = fakeObject(schema.body);
      }

      try {
        await operationFunction({ requestBody, ...params, ...querystring });
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
      expect(apiError.body.errorType).toBe(GeneralError.errorType.NOT_FOUND);
      expect(apiError.body.message).toBeDefined();
    });
  });
});

function getParamEndpoints() {
  const supportedOpenApiEndpoints: OpenApiOperationDetails[] = global.supportedOpenApiEndpoints;
  return supportedOpenApiEndpoints.filter((endpoint) => !!endpoint.schema.params);
}
