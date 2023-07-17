import ApiClient from '../../src/client';
import { OpenApiOperationDetails } from '../../src/server/schema';
import { ApiRequestOptions } from '../../src/client/generated/core/ApiRequestOptions';
import { createSecurityHeaders, SecurityHeaders } from '../../src/client/SecureClient';
import { ApiError, BadRequestError, RequestPart } from '../../src/client/generated';

type HeadersGenerator = (options: ApiRequestOptions) => SecurityHeaders;

function headersWithoutSignature(options: ApiRequestOptions): SecurityHeaders {
  const headers = createSecurityHeaders(options);
  headers.xFbapiSignature = '';
  return headers;
}

describe('Security header tests', () => {
  const supportedOpenApiEndpoints: OpenApiOperationDetails[] = global.supportedOpenApiEndpoints;

  describe.each(supportedOpenApiEndpoints)(
    '$method $url',
    ({ schema, operationId }: OpenApiOperationDetails) => {
      const sendRequest = async (headersGenerator: HeadersGenerator) => {
        const client = new ApiClient(headersGenerator);
        const operationFunction = client[schema.tags[0]]?.[operationId].bind(client);
        try {
          await operationFunction({});
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
    }
  );
});
