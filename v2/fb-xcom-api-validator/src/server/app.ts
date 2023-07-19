import config from '../config';
import logger from '../logging';
import { XComError } from '../error';
import { OpenApiSchema, loadOpenApiSchema } from './schema';
import { BadRequestError, RequestPart } from '../client/generated';
import Fastify, { HTTPMethods, RouteOptions } from 'fastify';
import { FastifySchemaValidationError, SchemaErrorDataVar } from 'fastify/types/schema';
import { verifySignatureMiddleware } from './middlewares/verify-signature-middleware';
import { nonceMiddleware } from './middlewares/nonce-middleware';
import { timestampMiddleware } from './middlewares/timestamp-middleware';
import { apiKeyMiddleware } from './middlewares/api-key-middleware';

const log = logger('app');

export async function createWebApp(): Promise<WebApp> {
  const openApiYamlPathname = config.getUnifiedOpenApiPathname();
  const schema = await loadOpenApiSchema(openApiYamlPathname);

  return new WebApp(schema);
}

export class WebApp {
  private readonly app: ReturnType<typeof Fastify>;

  constructor(private readonly schema: OpenApiSchema) {
    this.app = Fastify({
      logger: log.pinoLogger,
      schemaErrorFormatter,
    });
    this.app.addHook('preHandler', verifySignatureMiddleware);
    this.app.addHook('preHandler', nonceMiddleware);
    this.app.addHook('preHandler', timestampMiddleware);
    this.app.addHook('preHandler', apiKeyMiddleware);
  }

  public async start(): Promise<void> {
    const { port } = config.get('server');
    await this.app.listen({ port, host: '0.0.0.0' });
  }

  public addRoute(method: HTTPMethods, url: string, handler: RouteOptions['handler']): void {
    this.app.route({
      method,
      url,
      handler,
      schema: this.schema.getOperationSchema(method, url),
    });
  }
}

class SchemaError extends XComError implements BadRequestError {
  public readonly name = 'SchemaError';
  public readonly errorType = BadRequestError.errorType.SCHEMA_ERROR;

  constructor(public readonly message: string, public readonly requestPart: RequestPart) {
    super(message, { requestPart });
    log.error('SchemaError', undefined, this);
  }
}

class SchemaPropertyError extends XComError implements Required<BadRequestError> {
  public readonly name = 'SchemaPropertyError';
  public readonly errorType = BadRequestError.errorType.SCHEMA_PROPERTY_ERROR;

  constructor(
    public readonly message: string,
    public readonly propertyName: string,
    public readonly requestPart: RequestPart
  ) {
    super(message, { propertyName, requestPart });
    log.error('SchemaPropertyError', undefined, this);
  }
}

function schemaErrorFormatter(errors: FastifySchemaValidationError[], dataVar: SchemaErrorDataVar) {
  const error = errors[0];
  const message = `Request schema validation error: ${error.message}`;
  let erroneousProperty = '';

  if (error.instancePath) {
    erroneousProperty = error.instancePath;
  }
  if (error.keyword === 'required') {
    erroneousProperty += `/${error.params.missingProperty}`;
  }

  if (erroneousProperty) {
    return new SchemaPropertyError(message, erroneousProperty, RequestPart[dataVar.toUpperCase()]);
  } else {
    return new SchemaError(message, RequestPart[dataVar.toUpperCase()]);
  }
}
