import _ from 'lodash';
import { randomUUID } from 'crypto';
import { JsonValue } from 'type-fest';
import ApiClient from '../../src/client';
import { JSONSchemaFaker, Schema } from 'json-schema-faker';
import { EndpointSchema, getAllEndpointSchemas } from '../../src/schemas';
import { deleteDeepProperty, getPropertyPaths } from '../property-extraction';
import { getCapableAccountId, hasCapability } from '../utils/capable-accounts';
import { ApiComponents, ApiError, BadRequestError, RequestPart } from '../../src/client/generated';

JSONSchemaFaker.option('requiredOnly', true);

describe('Test request bodies missing one required property', () => {
  const client = new ApiClient();
  const postEndpoints = getAllEndpointSchemas().filter((op) => {
    const [capability] = op.schema.tags;
    return (
      op.method === 'POST' && op.schema.body && hasCapability(capability as keyof ApiComponents)
    );
  });

  let accountId: string;

  describe.each(postEndpoints)('$method $url', ({ operationId, url, schema }: EndpointSchema) => {
    const [component] = schema.tags;
    accountId = getCapableAccountId(component as keyof ApiComponents);

    // Test multiple times due to the randomness of the generated payloads
    describe.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])('Attempt %d', () => {
      const goodBody = JSONSchemaFaker.generate(schema.body as Schema);
      if (!goodBody || typeof goodBody !== 'object') throw new Error('Unexpected body type');

      const sendRequest = async (requestBody: JsonValue) => {
        const operationFunction = client[schema.tags[0]]?.[operationId].bind(client);

        try {
          await operationFunction({ requestBody, accountId });
        } catch (err) {
          if (err instanceof ApiError) {
            return err;
          }
          throw err;
        }
        throw new Error('Expected to throw');
      };

      for (const propertyPath of getPropertyPaths(goodBody)) {
        describe(`Body without ${propertyPath.join('.')}`, () => {
          let apiError: ApiError;

          beforeAll(async () => {
            const badBody = _.cloneDeep(goodBody);
            deleteDeepProperty(badBody, propertyPath);

            if (Object.hasOwn(badBody, 'idempotencyKey')) {
              badBody['idempotencyKey'] = randomUUID();
            }

            apiError = await sendRequest(badBody);
          });

          it('should respond with HTTP response code 400 (Bad Request)', () => {
            expect(apiError.status).toEqual(400);
          });
          it('should properly describe the error in the response body', () => {
            expect(apiError.body.requestPart).toEqual(RequestPart.BODY);
            expect(getExpectedVariants(url, propertyPath)).toContain(apiError.body.propertyName);
            expect(apiError.body.errorType).toEqual(
              BadRequestError.errorType.SCHEMA_PROPERTY_ERROR
            );
          });
        });
      }
    });
  });
});

// When missing a properties appearing in oneOf, the server might report as if
// a property in another branch of oneOf is missing. These are the sets of such
// properties for each endpoint
const ambiguousProperties = {
  '/accounts/:accountId/liquidity/quotes': [
    ['/toAmount', '/fromAmount'],
    ['/toAsset/nationalCurrencyCode', '/toAsset/cryptocurrencySymbol', '/toAsset/assetId'],
    ['/fromAsset/nationalCurrencyCode', '/fromAsset/cryptocurrencySymbol', '/fromAsset/assetId'],
  ],
  '/accounts/:accountId/trading/orders': [
    ['/quoteAssetQuantity', '/baseAssetQuantity', '/quoteAssetPrice', '/baseAssetPrice'],
  ],
  '/accounts/:accountId/transfers/withdrawals/blockchain': [
    [
      '/balanceAsset/nationalCurrencyCode',
      '/balanceAsset/cryptocurrencySymbol',
      '/balanceAsset/assetId',
    ],
    ['/destination/asset/cryptocurrencySymbol', '/destination/asset/assetId'],
  ],
  '/accounts/:accountId/transfers/withdrawals/fiat': [
    [
      '/balanceAsset/nationalCurrencyCode',
      '/balanceAsset/cryptocurrencySymbol',
      '/balanceAsset/assetId',
    ],
    [
      '/destination/transferMethod',
      '/destination/accountHolder',
      '/destination/swiftCode',
      '/destination/routingNumber',
      '/destination/iban',
      '/destination/accountHolder/name',
      '/destination/amount',
    ],
  ],
  '/accounts/:accountId/transfers/withdrawals/peeraccount': [
    [
      '/balanceAsset/nationalCurrencyCode',
      '/balanceAsset/cryptocurrencySymbol',
      '/balanceAsset/assetId',
    ],
    [
      '/destination/asset/nationalCurrencyCode',
      '/destination/asset/cryptocurrencySymbol',
      '/destination/asset/assetId',
    ],
  ],
  '/accounts/:accountId/transfers/withdrawals/subaccount': [
    [
      '/balanceAsset/nationalCurrencyCode',
      '/balanceAsset/cryptocurrencySymbol',
      '/balanceAsset/assetId',
    ],
    [
      '/destination/asset/nationalCurrencyCode',
      '/destination/asset/cryptocurrencySymbol',
      '/destination/asset/assetId',
    ],
  ],
  '/accounts/:accountId/transfers/deposits/addresses': [
    [
      '/transferMethod/asset/nationalCurrencyCode',
      '/transferMethod/asset/cryptocurrencySymbol',
      '/transferMethod/asset/assetId',
    ],
  ],
};

/**
 * Get the properties that a server can report as missing when the actual missing
 * property is `propertyPath`. This non-deterministic behavior can happen for any
 * property that is defined using `oneOf`.
 */
function getExpectedVariants(endpoint: string, propertyPath: string[]) {
  const prop = '/' + propertyPath.join('/');

  const propertiesSet = ambiguousProperties[endpoint];
  if (!propertiesSet) {
    return [prop];
  }

  for (const props of propertiesSet) {
    if (props.includes(prop)) {
      return props;
    }
  }

  return [prop];
}
