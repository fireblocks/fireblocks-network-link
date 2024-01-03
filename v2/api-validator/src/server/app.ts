import config from '../config';
import logger from '../logging';
import addFormats from 'ajv-formats';
import Ajv, { ValidateFunction } from 'ajv';
import { FastifyError } from '@fastify/error';
import { getServerUrlPathPrefix } from '../url-helpers';
import { FastifyBaseLogger } from 'fastify/types/logger';
import { nonceMiddleware } from './middlewares/nonce-middleware';
import { apiKeyMiddleware } from './middlewares/api-key-middleware';
import { timestampMiddleware } from './middlewares/timestamp-middleware';
import { getEndpointRequestSchema, loadOpenApiSchemas } from '../schemas';
import { BadRequestError, GeneralError, RequestPart } from '../client/generated';
import { verifySignatureMiddleware } from './middlewares/verify-signature-middleware';
import { ResponseSchemaValidationFailed, SchemaCompilationError, XComError } from '../error';
import { paginationValidationMiddleware } from './middlewares/pagination-validation-middleware';
import Fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  HTTPMethods,
  RouteOptions,
} from 'fastify';

const log = logger('app');

export async function createWebApp(): Promise<WebApp> {
  const openApiYamlPathname = config.getUnifiedOpenApiPathname();
  await loadOpenApiSchemas(openApiYamlPathname);

  return new WebApp();
}

export class WebApp {
  private readonly app: FastifyInstance;
  private readonly ajv = new Ajv({ strictSchema: false });

  constructor() {
    const loggerForFastify: FastifyBaseLogger = log.pinoLogger;

    addFormats(this.ajv);

    this.app = Fastify({
      logger: loggerForFastify,
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
    this.app.setErrorHandler(errorHandler);

    this.app.addHook('preHandler', verifySignatureMiddleware);
    this.app.addHook('preHandler', nonceMiddleware);
    this.app.addHook('preHandler', timestampMiddleware);
    this.app.addHook('preHandler', apiKeyMiddleware);
    this.app.addHook('preHandler', paginationValidationMiddleware);
    this.app.addHook('preSerialization', clientErrorLogger);

    // Override the default serializer. Some of the schemas are not serialized properly by the default serializer
    // due to a bug in the Fastify serialization library: https://github.com/fastify/fast-json-stringify/issues/290
    this.app.setSerializerCompiler(({ schema, method, url }) => {
      let validate: ValidateFunction;
      try {
        validate = this.ajv.compile(schema);
      } catch (err: any) {
        throw new SchemaCompilationError(err.toString(), method, url);
      }

      return (data) => {
        const success = validate(data);
        if (!success) {
          throw new ResponseSchemaValidationFailed(method, url, data, validate.errors?.[0]);
        }
        return JSON.stringify(data);
      };
    });
  }

  public async start(): Promise<void> {
    const { port } = config.get('server');
    await this.app.listen({ port, host: '0.0.0.0' });
  }

  public addRoute(method: HTTPMethods, url: string, handler: RouteOptions['handler']): void {
    const prefix = getServerUrlPathPrefix();
    this.app.route({
      method,
      url: prefix + url,
      handler,
      schema: getEndpointRequestSchema(method, url),
    });
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

class ContentTypeError extends XComError implements BadRequestError {
  public readonly name = 'ContentTypeError';
  public readonly errorType = BadRequestError.errorType.SCHEMA_ERROR;
  public readonly requestPart = RequestPart.HEADERS;

  constructor(contentType: string) {
    super(`Wrong content type: ${contentType}`, { requestPart: RequestPart.HEADERS });
  }
}

function errorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  if (error.code === 'FST_ERR_VALIDATION') {
    sendValidationError(error, reply);
  } else {
    log.error('Unexpected server error', { error, request: shapeRequestForLog(request) });

    const serverError: GeneralError = {
      message: 'Unexpected server error',
      errorType: GeneralError.errorType.INTERNAL_ERROR,
    };
    reply.status(500).send(serverError);
  }
}

function sendValidationError(error: FastifyError, reply: FastifyReply) {
  if (!error.validation || !error.validationContext) {
    log.error('Unexpected error', { error });
    return reply.status(error.statusCode ?? 500).send(error.message);
  }

  const validation = error.validation[0];
  const message = `Request schema validation error: ${validation.message}`;
  let erroneousProperty = '';

  if (validation.instancePath) {
    erroneousProperty = validation.instancePath;
  }
  if (validation.keyword === 'required') {
    erroneousProperty += `/${validation.params.missingProperty}`;
  }

  if (erroneousProperty) {
    const badRequest: BadRequestError = {
      message,
      propertyName: erroneousProperty,
      requestPart: RequestPart[error.validationContext.toUpperCase()],
      errorType: BadRequestError.errorType.SCHEMA_PROPERTY_ERROR,
    };
    reply.status(400).send(badRequest);
  } else {
    const badRequest: BadRequestError = {
      message,
      requestPart: RequestPart[error.validationContext.toUpperCase()],
      errorType: BadRequestError.errorType.SCHEMA_ERROR,
    };
    reply.status(400).send(badRequest);
  }
}

async function clientErrorLogger(request: FastifyRequest, reply: FastifyReply, payload: unknown) {
  const { statusCode } = reply;

  if (statusCode >= 400 && statusCode < 500) {
    reply.log.info({ statusCode, response: payload }, 'request filed due to client error');
  }

  return payload;
}
