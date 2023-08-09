import fs from 'fs';
import yaml from 'js-yaml';
import refParser from '@apidevtools/json-schema-ref-parser';
import { SomeJSONSchema } from 'ajv/dist/types/json-schema';
import { JSONSchemaFaker, Schema } from 'json-schema-faker';
import FastifyOpenApiParser from 'fastify-openapi-glue/lib/parser.v3';
import { XComError } from './error';
import { randomUUID } from 'crypto';

const schemas: { endpointSchemas: EndpointSchema[]; componentSchemas?: ApiComponents } = {
  endpointSchemas: [],
};

export type HttpRequestSchema = {
  operationId?: string;
  body?: unknown;
  querystring?: unknown;
  params?: unknown;
  headers?: unknown;
  response?: unknown;
  tags: string[];
};

export type EndpointSchema = {
  method: string;
  url: string;
  schema: HttpRequestSchema;
  operationId: string;
};

export type ApiComponents = {
  parameters: Record<string, unknown>;
  responses: Record<string, unknown>;
  schemas: Record<string, SomeJSONSchema>;
};

export type ParsedOpenApi = {
  routes: EndpointSchema[];
  generic: { components: ApiComponents };
};

export async function loadOpenApiSchemas(openApiYamlPathname: string): Promise<void> {
  const openApi = await parseOpenApiYaml(openApiYamlPathname);
  schemas.endpointSchemas = openApi.routes;
  schemas.componentSchemas = openApi.generic.components;
}

export function getAllEndpointSchemas(): EndpointSchema[] {
  return schemas.endpointSchemas;
}

export function getEndpointRequestSchema(method: string, url: string): HttpRequestSchema {
  if (!schemas.endpointSchemas) {
    throw new OpenApiSchemasNotLoaded();
  }

  const schema = schemas.endpointSchemas.find(
    (x) => x.method.toUpperCase() == method.toUpperCase() && x.url == url
  );

  if (!schema) {
    throw new OpenApiSchemaNotFound(method, url);
  }

  return schema.schema;
}

export function getObjectSchema(objectName: string): SomeJSONSchema {
  if (!schemas.componentSchemas) {
    throw new OpenApiSchemasNotLoaded();
  }

  const schema = schemas.componentSchemas.schemas[objectName];
  if (!schema) {
    throw new OpenApiObjectSchemaNotFound(objectName);
  }

  return schema;
}

export function fakeSchemaObject(objectName: string): unknown {
  const schema = getObjectSchema(objectName);
  JSONSchemaFaker.option('alwaysFakeOptionals', true);
  const faked = JSONSchemaFaker.generate(schema as Schema);
  if (faked?.['id']) {
    faked['id'] = randomUUID();
  }
  if (faked?.['idempotencyKey']) {
    faked['idempotencyKey'] = randomUUID();
  }
  return faked;
}

export class OpenApiSchemaNotFound extends XComError {
  constructor(method: string, url: string) {
    super('OpenAPI schema not found', { method, url });
  }
}

export class OpenApiObjectSchemaNotFound extends XComError {
  constructor(objectName: string) {
    super('OpenAPI object schema not found', { objectName });
  }
}

export class OpenApiSchemasNotLoaded extends XComError {
  constructor() {
    super('OpenAPI schemas were not loaded');
  }
}

export function loadYaml(yamlPathname: string): unknown {
  const yamlText = fs.readFileSync(yamlPathname).toString();
  return yaml.load(yamlText);
}

export async function parseOpenApiYaml(yamlPathname: string): Promise<ParsedOpenApi> {
  const openApi = await refParser.dereference(loadYaml(yamlPathname) as any);
  const parser = new FastifyOpenApiParser();
  return parser.parse(openApi);
}
