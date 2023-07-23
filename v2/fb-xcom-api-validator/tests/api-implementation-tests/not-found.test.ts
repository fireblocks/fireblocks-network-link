import { randomUUID } from 'crypto';
import { JsonValue } from 'type-fest';
import Client from '../../src/client';
import { JSONSchemaFaker } from 'json-schema-faker';
import { ApiError, ErrorType } from '../../src/client/generated';
import { OpenApiOperationDetails } from '../../src/server/schema';

describe('Not Found tests', () => {
  describe.each(getParamEndpoints())('$method $url', ({ method, url, operationId, schema }) => {
    let apiError: ApiError;

    const requestNonExistingResource = async () => {
      const client = new Client();
      const operationFunction = client[schema.tags[0]]?.[operationId].bind(client);
      const paramValues = createParamValues(schema);

      let requestBody: JsonValue | undefined = undefined;
      if (method === 'POST' && schema?.body) {
        requestBody = await JSONSchemaFaker.resolve(schema.body);
      }
      console.log(`${method} ${url}`);
      console.log(requestBody);

      try {
        await operationFunction({ requestBody, ...paramValues });
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
    });
  });
});

function createParamValues(schema: OpenApiOperationDetails['schema']) {
  const paramProperties = Object.keys((schema.params as any).properties);
  return paramProperties.reduce((prev, curr) => {
    prev[curr] = randomUUID();
    return prev;
  }, {});
}

function getParamEndpoints() {
  const supportedOpenApiEndpoints: OpenApiOperationDetails[] = global.supportedOpenApiEndpoints;
  return supportedOpenApiEndpoints.filter((endpoint) => !!endpoint.schema.params);
}
