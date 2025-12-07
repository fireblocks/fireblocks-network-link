import config from '../../src/config';
import {
  fakeSchemaObject,
  getEndpointRequestSchema,
  getObjectSchema,
  loadOpenApiSchemas,
} from '../../src/schemas';
import { RampRequest } from '../../src/client/generated';

describe('Test loading OpenAPI schemas from YAML file', () => {
  beforeAll(async () => {
    const openApiYamlPathname = config.getUnifiedOpenApiPathname();
    await loadOpenApiSchemas(openApiYamlPathname);
  });

  it('should load endpoint schemas', () => {
    const schema = getEndpointRequestSchema('GET', '/capabilities');
    expect(schema).toBeDefined();
    expect(schema.operationId).toEqual('getCapabilities');
  });

  it('should load object schemas', () => {
    const schema = getObjectSchema('GeneralError');
    expect(schema).toBeDefined();
    expect(schema.type).toEqual('object');
  });

  it('should be able to fake an object', () => {
    const orderRequest = fakeSchemaObject('RampRequest') as RampRequest;
    expect(orderRequest).toBeDefined();
    expect(orderRequest.idempotencyKey).toMatch(/(\w+-){4}\w+/);
  });
});
