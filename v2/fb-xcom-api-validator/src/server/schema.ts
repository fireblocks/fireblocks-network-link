import fs from 'fs';
import yaml from 'js-yaml';
import refParser from '@apidevtools/json-schema-ref-parser';
import FastifyOpenApiParser from 'fastify-openapi-glue/lib/parser.v3';
import { FastifySchema, HTTPMethods } from 'fastify';
import { XComError } from '../error';

export async function loadOpenApiSchema(openApiYamlPathname: string): Promise<OpenApiSchema> {
  const schemas = await parseOpenApiYaml(openApiYamlPathname);
  return new OpenApiSchema(schemas);
}

export type OpenApiOperationDetails = {
  method: HTTPMethods;
  url: string;
  schema: FastifySchema & { tags: string[] };
  operationId: string;
};

export class OpenApiSchema {
  constructor(private readonly schemas: OpenApiOperationDetails[]) {}

  public getOperationSchema(method: HTTPMethods, url: string): FastifySchema {
    const schema = this.schemas.find((x) => x.method == method && x.url == url);

    if (!schema) {
      throw new OpenApiSchemaNotFound(method, url);
    }

    return schema.schema;
  }
}

export class OpenApiSchemaNotFound extends XComError {
  constructor(method: HTTPMethods, url: string) {
    super('OpenAPI schema not found', { method, url });
  }
}

export function loadYaml(yamlPathname: string) {
  const yamlText = fs.readFileSync(yamlPathname).toString();
  return yaml.load(yamlText);
}

export async function parseOpenApiYaml(yamlPathname: string): Promise<OpenApiOperationDetails[]> {
  const openApi = await refParser.dereference(loadYaml(yamlPathname));

  const parser = new FastifyOpenApiParser();
  return parser.parse(openApi).routes;
}
