import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';
import { SomeJSONSchema } from 'ajv/dist/types/json-schema';
import { BadRequestError, RequestPart } from '../../client/generated';

const BAD_PAGINATION_ERROR: BadRequestError = {
  message: 'Cannot specify both startingAfter and endingBefore',
  errorType: BadRequestError.errorType.SCHEMA_ERROR,
  requestPart: RequestPart.QUERYSTRING,
};

function endpointSupportsPagination(request: FastifyRequest): boolean {
  const schema = request.routeSchema.querystring as SomeJSONSchema | undefined;
  return !!schema?.properties?.limit;
}

export function paginationValidationMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
): void {
  if (!endpointSupportsPagination(request)) {
    done();
  }

  const { startingAfter, endingBefore } = request.query as any;

  if (startingAfter && endingBefore) {
    reply.code(400).send(BAD_PAGINATION_ERROR);
    return;
  }

  done();
}
