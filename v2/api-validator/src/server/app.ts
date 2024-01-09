import config from '../config';
import logger from '../logging';
import addFormats from 'ajv-formats';
import Ajv, { ValidateFunction } from 'ajv';
import { FastifyError } from '@fastify/error';
import { loadOpenApiSchemas } from '../schemas';
import { fbNetworkLinkFastifyPlugin } from './routes';
import { getServerUrlPathPrefix } from '../url-helpers';
import { FastifyBaseLogger } from 'fastify/types/logger';
import { BadRequestError, GeneralError, RequestPart } from '../client/generated';
import { ResponseSchemaValidationFailed, SchemaCompilationError, XComError } from '../error';
import Fastify, { FastifyInstance, FastifyReply, FastifyRequest, FastifySchema } from 'fastify';
import { ContentTypeParserDoneFunction } from 'fastify/types/content-type-parser';

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

    ajvRegisterJsonSchemaStandardStringFormats(this.ajv);

    this.app = Fastify({
      logger: loggerForFastify,
    });

    this.app.setErrorHandler(errorHandler);
    this.app.addHook('preSerialization', clientErrorLogger);

    // Override the default serializer. Some of the schemas are not serialized properly by the default serializer
    // due to a bug in the Fastify serialization library: https://github.com/fastify/fast-json-stringify/issues/290
    this.app.setSerializerCompiler((route) =>
      this.makeResponseSerializer(route.schema, route.method, route.url)
    );

    // For POST routes that do not define request body, allow application/x-www-form-urlencoded
    // content type and ignore the body
    this.app.addContentTypeParser('application/x-www-form-urlencoded', contentTypeParserEmptyBody);

    this.app.register(fbNetworkLinkFastifyPlugin, { prefix: getServerUrlPathPrefix() });
  }

  public async start(): Promise<void> {
    const { port } = config.get('server');
    await this.app.listen({ port, host: '0.0.0.0' });
  }

  /**
   * Returns a function that validates and serializes responses for a specific endpoint.
   */
  private makeResponseSerializer(schema: FastifySchema, method: string, url: string) {
    const validator = this.compileSchema(schema, method, url);

    return (data) => {
      const success = validator(data);
      if (!success) {
        throw new ResponseSchemaValidationFailed(method, url, data, validator.errors?.[0]);
      }
      return JSON.stringify(data);
    };
  }

  private compileSchema(schema: FastifySchema, method: string, url: string): ValidateFunction {
    try {
      return this.ajv.compile(schema);
    } catch (err: any) {
      throw new SchemaCompilationError(err.toString(), method, url);
    }
  }
}

function ajvRegisterJsonSchemaStandardStringFormats(ajv: Ajv) {
  addFormats(ajv);
}

/**
 * Content type parser that allows any body for request to endpoints
 * that do not define body in their schema.
 */
function contentTypeParserEmptyBody(
  req: FastifyRequest,
  _body: unknown,
  done: ContentTypeParserDoneFunction
) {
  if (!req.routeSchema.body) {
    done(null, {});
  } else {
    done(new ContentTypeError(req.headers['content-type'] ?? 'undefined'), undefined);
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
    reply.log.info({ statusCode, response: payload }, 'request failed due to client error');
  }

  return payload;
}

class ContentTypeError extends XComError implements BadRequestError {
  public readonly name = 'ContentTypeError';
  public readonly errorType = BadRequestError.errorType.SCHEMA_ERROR;
  public readonly requestPart = RequestPart.HEADERS;

  constructor(contentType: string) {
    super(`Wrong content type: ${contentType}`, { requestPart: RequestPart.HEADERS });
  }
}
