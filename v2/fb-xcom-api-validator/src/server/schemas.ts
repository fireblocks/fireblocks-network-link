import fs from 'fs';
import yaml from 'js-yaml';
import refParser from '@apidevtools/json-schema-ref-parser';
import FastifyOpenApiParser from 'fastify-openapi-glue/lib/parser.v3';
import { FastifySchema, HTTPMethods } from 'fastify';
import { XComError } from '../error';

export async function loadFastifySchemas(openApiYamlPathname: string): Promise<FastifySchemas> {
  const schemas = await parseOpenApiYaml(openApiYamlPathname);
  return new FastifySchemas(schemas);
}

interface FastifySchemaExtended {
  method: HTTPMethods;
  url: string;
  schema: FastifySchema;
  operationId: string;
}

export class FastifySchemas {
  constructor(private readonly schemas: FastifySchemaExtended[]) {}

  public getSchema(method: HTTPMethods, url: string): FastifySchema {
    const schema = this.schemas.find((x) => x.method == method && x.url == url);

    if (!schema) {
      throw new FastifySchemaNotFound(method, url);
    }

    return schema.schema;
  }
}

class FastifySchemaNotFound extends XComError {
  constructor(method: HTTPMethods, url: string) {
    super('Fastify schema not found', { method, url });
  }
}

async function parseOpenApiYaml(yamlPathname: string): Promise<FastifySchemaExtended[]> {
  const yamlText = fs.readFileSync(yamlPathname).toString();
  const openApi = await refParser.dereference(yaml.load(yamlText));

  const parser = new FastifyOpenApiParser();
  return parser.parse(openApi).routes;
}
