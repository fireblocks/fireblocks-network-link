import { randomUUID } from 'crypto';
import { JsonValue } from 'type-fest';
import { fakeObject } from '../faker';
import Client from '../../src/client';
import { hasCapability } from '../utils/capable-accounts';
import { EndpointSchema, getAllEndpointSchemas } from '../../src/schemas';
import { ApiComponents, ApiError, GeneralError } from '../../src/client/generated';

describe('Not Found tests', () => {
  describe.each(getParamEndpoints())('$method $url', ({ method, operationId, schema }) => {
    let apiError: ApiError;

    const requestNonExistingResource = async () => {
      const client = new Client();
      // Try to find the operation in any of the tagged services
      let operationFunction;
      const servicesToCheck = [...schema.tags];
      
      // For transfer operations, also check the general 'transfers' service
      // as multi-tagged operations might end up there
      if (schema.tags.some(tag => ['transfersFiat', 'transfersBlockchain'].includes(tag))) {
        servicesToCheck.push('transfers');
      }

      for (const tag of servicesToCheck) {
        const service = client[tag];
        if (service && service[operationId]) {
          operationFunction = service[operationId].bind(client);
          break;
        }
      }

      if (!operationFunction) {
        throw new Error(`Operation ${operationId} not found in any of the tagged services: ${servicesToCheck.join(', ')}`);
      }

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

        if (requestBody && Object.hasOwn(requestBody, 'idempotencyKey')) {
          requestBody['idempotencyKey'] = randomUUID();
        }
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

function getParamEndpoints(): EndpointSchema[] {
  return getAllEndpointSchemas().filter((endpoint) => {
    const [capability] = endpoint.schema.tags;
    return !!endpoint.schema.params && hasCapability(capability as keyof ApiComponents);
  });
}
