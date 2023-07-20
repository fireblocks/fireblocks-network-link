import Client from '../../src/client';
import { OpenApiOperationDetails } from '../../src/server/schema';
import {
  ApiError,
  BadRequestError,
  PaginationEndingBefore,
  PaginationLimit,
  PaginationStartingAfter,
  RequestPart,
} from '../../src/client/generated';

type PaginationParams = {
  limit?: PaginationLimit;
  startingAfter?: PaginationStartingAfter;
  endingBefore?: PaginationEndingBefore;
};

describe('Pagination params tests', () => {
  describe.each(getPaginatedEndpoints())('$method $url', ({ operationId, schema }) => {
    let apiError: ApiError;

    const sendRequest = async (paginationParams: PaginationParams) => {
      const client = new Client();
      const operationFunction = client[schema.tags[0]]?.[operationId].bind(client);

      try {
        await operationFunction(paginationParams);
      } catch (err) {
        if (err instanceof ApiError) {
          return err;
        }
        throw err;
      }
      throw new Error('Expected to throw');
    };

    describe.each([-1, 0, 201])('With invalid limit value: %d', (limit) => {
      beforeAll(async () => {
        apiError = await sendRequest({ limit });
      });

      it('should respond with HTTP response code 400 (Bad Request)', () => {
        expect(apiError.status).toEqual(400);
      });

      it('should properly describe the error in the response body', () => {
        expect(apiError.body.errorType).toEqual(BadRequestError.errorType.SCHEMA_PROPERTY_ERROR);
        expect(apiError.body.requestPart).toEqual(RequestPart.QUERYSTRING);
        expect(apiError.body.propertyName).toEqual('limit');
      });
    });

    describe('Using endingBefore with startingAfter', () => {
      beforeAll(async () => {
        apiError = await sendRequest({ startingAfter: 'x', endingBefore: 'y' });
      });

      it('should respond with HTTP response code 400 (Bad Request)', () => {
        expect(apiError.status).toEqual(400);
      });

      it('should properly describe the error in the response body', () => {
        expect(apiError.body.errorType).toEqual(BadRequestError.errorType.SCHEMA_ERROR);
        expect(apiError.body.requestPart).toEqual(RequestPart.QUERYSTRING);
      });
    });
  });
});

function getPaginatedEndpoints() {
  const supportedOpenApiEndpoints: OpenApiOperationDetails[] = global.supportedOpenApiEndpoints;
  return supportedOpenApiEndpoints.filter(
    (endpoint) => (endpoint.schema.querystring as any)?.properties?.limit
  );
}
