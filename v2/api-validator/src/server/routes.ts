import logger from '../logging';
import * as Handlers from './handlers';
import { getAllEndpointSchemas } from '../schemas';
import * as ErrorFactory from './http-error-factory';
import { FastifyInstance, FastifyReply, FastifyRequest, HTTPMethods } from 'fastify';
import { verifySignatureMiddleware } from './middlewares/verify-signature-middleware';
import { paginationValidationMiddleware } from './middlewares/pagination-validation-middleware';
import { timestampMiddleware } from './middlewares/timestamp-middleware';
import { apiKeyMiddleware } from './middlewares/api-key-middleware';
import { nonceMiddleware } from './middlewares/nonce-middleware';

const log = logger('app:routes');

export async function fbNetworkLinkFastifyPlugin(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', verifySignatureMiddleware);
  app.addHook('preHandler', nonceMiddleware);
  app.addHook('preHandler', timestampMiddleware);
  app.addHook('preHandler', apiKeyMiddleware);
  app.addHook('preHandler', paginationValidationMiddleware);

  app.register(routes);
}

/**
 * Registers all the routes listed in the schema by looking, for each endpoint,
 * for a handler function with a name identical to the endpoint operation ID.
 * If such a function does not exist, a warning is logged and an empty
 * implementation is used.
 */
async function routes(app: FastifyInstance): Promise<void> {
  let dummyRoutesCount = 0;

  for (const { method, url, operationId, schema } of getAllEndpointSchemas()) {
    const useDummyHandler = !Handlers[operationId];
    const dummyHandler = schema.params ? alwaysReturns404 : alwaysReturns200;

    const handler = useDummyHandler ? dummyHandler : Handlers[operationId];
    app.route({ method: method as HTTPMethods, url, handler, schema });

    const registrationInfo = { method, url, operationId, useDummyHandler };
    if (useDummyHandler) {
      dummyRoutesCount++;
      log.warn('Dummy route registered', registrationInfo);
    } else {
      log.debug('Route registered', registrationInfo);
    }
  }

  if (dummyRoutesCount === 0) {
    log.info('All schema endpoints have proper handlers 🎉');
  } else {
    log.warn('Some schema endpoints are not implemented', { dummyRoutesCount });
  }
}

async function alwaysReturns200(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  reply.code(200).send();
}

async function alwaysReturns404(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  return ErrorFactory.notFound(reply);
}
