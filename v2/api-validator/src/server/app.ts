import config from '../config';
import logger from '../logging';
import { XComError } from '../error';
import { BadRequestError, RequestPart } from '../client/generated';
import { loadOpenApiSchema, OpenApiOperationDetails, OpenApiSchema } from './schema';
import Fastify, { FastifyReply, FastifyRequest, HTTPMethods, RouteOptions } from 'fastify';
import { FastifySchemaValidationError, SchemaErrorDataVar } from 'fastify/types/schema';
import { verifySignatureMiddleware } from './middlewares/verify-signature-middleware';
import { nonceMiddleware } from './middlewares/nonce-middleware';
import { timestampMiddleware } from './middlewares/timestamp-middleware';
import { apiKeyMiddleware } from './middlewares/api-key-middleware';
import { paginationValidationMiddleware } from './middlewares/pagination-validation-middleware';

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

    // For POST routes that do not define request body, allow any content type
    // and ignore the body
    const routesWithoutBodyContentParser = (req, body, done) => {
      if (!req.routeSchema.body) {
        done(null, {});
      } else {
        done(new ContentTypeError(req.headers['content-type']), undefined);
      }
    };
    this.app.addContentTypeParser(
      'application/x-www-form-urlencoded',
      routesWithoutBodyContentParser
    );

    this.app.addHook('preHandler', verifySignatureMiddleware);
    this.app.addHook('preHandler', nonceMiddleware);
    this.app.addHook('preHandler', timestampMiddleware);
    this.app.addHook('preHandler', apiKeyMiddleware);
    this.app.addHook('preHandler', paginationValidationMiddleware);
    this.app.addHook('onSend', onSend);
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

  public getAllOperations(): OpenApiOperationDetails[] {
    return this.schema.getAllOperations();
  }
}

function shapeRequestForLog(request: FastifyRequest) {
  return {
    method: request.method,
    url: request.url,
    body: request.body,
    params: request.params,
    query: request.query,
    headers: request.headers,
    requestId: request.id,
  };
}

function onSend(request: FastifyRequest, reply: FastifyReply, payload: string, done) {
  if (reply.statusCode >= 400) {
    const logData = {
      statusCode: reply.statusCode,
      request: shapeRequestForLog(request),
      reply: {
        statusCode: reply.statusCode,
        payload: JSON.parse(payload),
      },
    };

    if (reply.statusCode >= 500) {
      log.error('Server error', logData);
    } else {
      log.info('Client error', logData);
    }
  }
  done(null, payload);
}

class ContentTypeError extends XComError implements BadRequestError {
  public readonly name = 'ContentTypeError';
  public readonly errorType = BadRequestError.errorType.SCHEMA_ERROR;
  public readonly requestPart = RequestPart.HEADERS;

  constructor(contentType: string) {
    super(`Wrong content type: ${contentType}`, { requestPart: RequestPart.HEADERS });
  }
}

class SchemaError extends XComError implements BadRequestError {
  public readonly name = 'SchemaError';
  public readonly errorType = BadRequestError.errorType.SCHEMA_ERROR;

  constructor(public readonly message: string, public readonly requestPart: RequestPart) {
    super(message, { requestPart });
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
