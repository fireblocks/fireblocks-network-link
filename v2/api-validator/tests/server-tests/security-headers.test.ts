import { JsonValue } from 'type-fest';
import { fakeObject } from '../faker';
import ApiClient from '../../src/client';
import { AxiosRequestConfig } from 'axios';
import { hasCapability } from '../utils/capable-accounts';
import { getAllEndpointSchemas } from '../../src/schemas';
import { createSecurityHeaders, SecurityHeaders } from '../../src/client/SecureClient';
import {
  ApiComponents,
  ApiError,
  BadRequestError,
  RequestPart,
  UnauthorizedError,
} from '../../src/client/generated';

type HeadersGenerator = (options: AxiosRequestConfig) => SecurityHeaders;

function headersWithoutSignature(options: AxiosRequestConfig): SecurityHeaders {
  const headers = createSecurityHeaders(options);
  headers.xFbapiSignature = '';
  return headers;
}

function headersWithoutApiKey(options: AxiosRequestConfig): SecurityHeaders {
  const headers = createSecurityHeaders(options);
  headers.xFbapiKey = '';
  return headers;
}

function headersWithoutNonce(options: AxiosRequestConfig): SecurityHeaders {
  return createSecurityHeaders(options, { nonce: '' });
}

function headersWithoutTimestamp(options: AxiosRequestConfig): SecurityHeaders {
  return createSecurityHeaders(options, { timestamp: 0 });
}

describe('Security header tests', () => {
  const supportedOpenApiEndpoints = getAllEndpointSchemas().filter((op) => {
    const [capability] = op.schema.tags;
    return hasCapability(capability as keyof ApiComponents);
  });

  describe.each(supportedOpenApiEndpoints)('$method $url', ({ method, operationId, schema }) => {
    const sendRequest = async (headersGenerator: HeadersGenerator) => {
      const client = new ApiClient(headersGenerator);
      const operationFunction = client[schema.tags[0]]?.[operationId].bind(client);

      const params = fakeObject(schema.params);
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

    describe('Request without signature', () => {
      let apiError: ApiError;

      beforeAll(async () => {
        apiError = await sendRequest(headersWithoutSignature);
      });

      it('should respond with HTTP response code 400 (Bad Request)', () => {
        expect(apiError.status).toEqual(400);
      });
      it('should properly describe the error in the response body', () => {
        expect(apiError.body.errorType).toEqual(BadRequestError.errorType.SCHEMA_PROPERTY_ERROR);
        expect(apiError.body.requestPart).toEqual(RequestPart.HEADERS);
        expect(apiError.body.propertyName).toEqual('X-FBAPI-SIGNATURE');
      });
    });

    describe('Request without api key', () => {
      let apiError: ApiError;

      beforeAll(async () => {
        apiError = await sendRequest(headersWithoutApiKey);
      });

      it('should respond with HTTP response code 401 (Unauthorized)', () => {
        expect(apiError.status).toEqual(401);
      });
      it('should properly describe the error in the response body', () => {
        expect(apiError.body.errorType).toEqual(UnauthorizedError.errorType.UNAUTHORIZED);
        expect(apiError.body.requestPart).toEqual(UnauthorizedError.requestPart.HEADERS);
        expect(apiError.body.propertyName).toEqual('X-FBAPI-KEY');
      });
    });

    describe('Request without nonce', () => {
      let apiError: ApiError;

      beforeAll(async () => {
        apiError = await sendRequest(headersWithoutNonce);
      });

      it('should respond with HTTP response code 400 (Bad Request)', () => {
        expect(apiError.status).toEqual(400);
      });
      it('should properly describe the error in the response body', () => {
        expect(apiError.body.errorType).toEqual(BadRequestError.errorType.SCHEMA_PROPERTY_ERROR);
        expect(apiError.body.requestPart).toEqual(RequestPart.HEADERS);
        expect(apiError.body.propertyName).toEqual('X-FBAPI-NONCE');
      });
    });

    describe('Request without timestamp', () => {
      let apiError: ApiError;

      beforeAll(async () => {
        apiError = await sendRequest(headersWithoutTimestamp);
      });

      it('should respond with HTTP response code 400 (Bad Request)', () => {
        expect(apiError.status).toEqual(400);
      });
      it('should properly describe the error in the response body', () => {
        expect(apiError.body.errorType).toEqual(BadRequestError.errorType.SCHEMA_PROPERTY_ERROR);
        expect(apiError.body.requestPart).toEqual(RequestPart.HEADERS);
        expect(apiError.body.propertyName).toEqual('X-FBAPI-TIMESTAMP');
      });
    });
  });
});
