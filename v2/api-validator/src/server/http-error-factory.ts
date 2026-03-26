import { FastifyReply } from 'fastify';
import { BadRequestError, BadRequestErrorType, GeneralError } from '../client/generated';

export function notFound(reply: FastifyReply): FastifyReply {
  const errorData: GeneralError = {
    message: 'Entity not found',
    errorType: GeneralError.errorType.NOT_FOUND,
  };
  return reply.code(404).send(errorData);
}

export function badRequest(reply: FastifyReply, errorData: BadRequestError): FastifyReply {
  return reply.code(400).send(errorData);
}

export function orderNotTrading(reply: FastifyReply): FastifyReply {
  const errorData: BadRequestError = {
    message: 'Cannot cancel non active order',
    errorType: BadRequestErrorType.ORDER_NOT_TRADING,
  };
  return reply.code(400).send(errorData);
}

export function idempotencyKeyReuse(reply: FastifyReply): FastifyReply {
  const errorData: BadRequestError = {
    message: 'Idempotency key has already been used for a different request',
    errorType: BadRequestErrorType.IDEMPOTENCY_KEY_REUSE,
  };
  return reply.code(400).send(errorData);
}

export function unsupportedBaseAsset(reply: FastifyReply): FastifyReply {
  const errorData: BadRequestError = {
    message: 'The base asset is not supported by the provider',
    errorType: BadRequestErrorType.UNSUPPORTED_SOURCE_ASSET,
  };
  return reply.code(400).send(errorData);
}

export function unsupportedQuoteAsset(reply: FastifyReply): FastifyReply {
  const errorData: BadRequestError = {
    message: 'The quote asset is not supported by the provider',
    errorType: BadRequestErrorType.UNSUPPORTED_DESTINATION_ASSET,
  };
  return reply.code(400).send(errorData);
}

export function amountBelowMinimum(reply: FastifyReply): FastifyReply {
  const errorData: BadRequestError = {
    message: 'The requested amount is below the provider minimum',
    errorType: BadRequestErrorType.AMOUNT_BELOW_MINIMUM,
  };
  return reply.code(400).send(errorData);
}

export function piiMissing(reply: FastifyReply): FastifyReply {
  const errorData: BadRequestError = {
    message: 'Required KYC / PII information is missing',
    errorType: BadRequestErrorType.PII_MISSING,
  };
  return reply.code(400).send(errorData);
}

export function unsupportedExternalSource(reply: FastifyReply): FastifyReply {
  const errorData: BadRequestError = {
    message: 'Provider requires source to be internal to Fireblocks for screening',
    errorType: BadRequestErrorType.UNSUPPORTED_EXTERNAL_SOURCE,
  };
  return reply.code(400).send(errorData);
}

export function unsupportedRegion(reply: FastifyReply): FastifyReply {
  const errorData: BadRequestError = {
    message: 'Provider does not support orders from the customer region',
    errorType: BadRequestErrorType.UNSUPPORTED_REGION,
  };
  return reply.code(400).send(errorData);
}

export function destinationNotWhitelisted(reply: FastifyReply): FastifyReply {
  const errorData: BadRequestError = {
    message: 'The destination address must be whitelisted with the provider first',
    errorType: BadRequestErrorType.DESTINATION_NOT_WHITELISTED,
  };
  return reply.code(400).send(errorData);
}
