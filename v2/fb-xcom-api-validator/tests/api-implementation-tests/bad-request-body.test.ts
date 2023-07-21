import _ from 'lodash';
import { JsonValue } from 'type-fest';
import ApiClient from '../../src/client';
import { JSONSchemaFaker, Schema } from 'json-schema-faker';
import { OpenApiOperationDetails } from '../../src/server/schema';
import { ApiError, BadRequestError, RequestPart } from '../../src/client/generated';

JSONSchemaFaker.option('requiredOnly', true);

describe('Test request bodies missing one required property', () => {
  const client = new ApiClient();
  const postEndpoints: OpenApiOperationDetails[] = global.supportedOpenApiEndpoints.filter(
    (op) => op.method === 'POST' && op.schema.body
  );

  describe.each(postEndpoints)(
    '$method $url',
    ({ operationId, schema }: OpenApiOperationDetails) => {
      const goodBody = JSONSchemaFaker.generate(schema.body as Schema);
      if (!goodBody || typeof goodBody !== 'object') throw new Error('Unexpected body type');

      const sendRequest = async (requestBody: JsonValue) => {
        const operationFunction = client[schema.tags[0]]?.[operationId].bind(client);

        try {
          await operationFunction({ requestBody });
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
            apiError = await sendRequest(badBody);
          });

          it('should respond with HTTP response code 400 (Bad Request)', () => {
            expect(apiError.status).toEqual(400);
          });
          it('should properly describe the error in the response body', () => {
            expect(apiError.body.requestPart).toEqual(RequestPart.HEADERS);
            expect(apiError.body.propertyName).toEqual('/' + propertyPath.join('/'));
            expect(apiError.body.errorType).toEqual(
              BadRequestError.errorType.SCHEMA_PROPERTY_ERROR
            );
          });
        });
      }
    }
  );
});

describe('getPropertyPaths', () => {
  it('should work for empty objects', () => {
    const result = getPropertyPaths({});
    expect(result).toEqual([]);
  });

  it('should work for undefined objects', () => {
    const result = getPropertyPaths(undefined);
    expect(result).toEqual([]);
  });

  it('should work for null objects', () => {
    const result = getPropertyPaths(null);
    expect(result).toEqual([]);
  });

  it('should work for objects with one simple property', () => {
    const result = getPropertyPaths({ a: 100 });
    expect(result).toEqual([['a']]);
  });

  it('should work for objects with nested properties', () => {
    const result = getPropertyPaths({
      a: 100,
      b: {
        c: 'c',
        d: {
          e: 200,
          f: 300,
        },
      },
      g: 'g',
    });
    expect(result).toEqual([
      ['a'],
      ['b'],
      ['b', 'c'],
      ['b', 'd'],
      ['b', 'd', 'e'],
      ['b', 'd', 'f'],
      ['g'],
    ]);
  });
});

describe('deleteDeepProperty', () => {
  let obj: object;

  beforeEach(() => {
    obj = { a: 1, b: { c: { d: 2 } } };
  });

  it('should do nothing if path is empty', () => {
    deleteDeepProperty(obj, []);
    expect(obj).toEqual({ a: 1, b: { c: { d: 2 } } });
  });
  it('should be able to remove top level non-object property', () => {
    deleteDeepProperty(obj, ['a']);
    expect(obj).toEqual({ b: { c: { d: 2 } } });
  });
  it('should be able to remove top level object property', () => {
    deleteDeepProperty(obj, ['b']);
    expect(obj).toEqual({ a: 1 });
  });
  it('should be able to remove property of property', () => {
    deleteDeepProperty(obj, ['b', 'c']);
    expect(obj).toEqual({ a: 1, b: {} });
  });
  it('should be able to remove property of property of property', () => {
    deleteDeepProperty(obj, ['b', 'c', 'd']);
    expect(obj).toEqual({ a: 1, b: { c: {} } });
  });
});

function isObject(x) {
  return x && typeof x === 'object' && !Array.isArray(x);
}

function getPropertyPaths(obj?: JsonValue): Array<Array<string>> {
  if (!isObject(obj) || typeof obj === 'string') {
    return [];
  }

  const getAllPropPaths = (obj, head: string[] = []) => {
    const paths: Array<Array<string>> = [];

    for (const [key, value] of Object.entries(obj)) {
      const path = [...head, key];
      paths.push(path);

      if (isObject(value)) {
        paths.push(...getAllPropPaths(value, path));
      }
    }

    return paths;
  };

  return getAllPropPaths(obj);
}

function deleteDeepProperty(obj: object, propertyPath: string[]) {
  const lastProp = propertyPath.pop();
  if (!lastProp) return;

  let targetObj = obj;
  for (const prop of propertyPath) {
    targetObj = targetObj[prop];
  }

  delete targetObj[lastProp];
}
