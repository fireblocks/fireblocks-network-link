import { WebApp } from './app';
import logger from '../logging';
import * as Handlers from './handlers';
import * as ErrorFactory from './http-error-factory';
import { FastifyReply, FastifyRequest } from 'fastify';

const log = logger('app:routes');

async function alwaysReturns200(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  reply.code(200).send();
}

async function alwaysReturns404(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  return ErrorFactory.notFound(reply);
}

export function registerRoutes(app: WebApp): void {
  for (const { method, url, operationId, schema } of app.getAllOperations()) {
    const stubHandler = schema.params ? alwaysReturns404 : alwaysReturns200;

    const handler = Handlers[operationId] ?? stubHandler;
    app.addRoute(method, url, handler);

    const usingDummyHandler = !Handlers[operationId];
    const registrationInfo = { method, url, operationId, isDummy: usingDummyHandler };
    if (usingDummyHandler) {
      log.warn('Route registered', registrationInfo);
    } else {
      log.debug('Route registered', registrationInfo);
    }
  }
}
