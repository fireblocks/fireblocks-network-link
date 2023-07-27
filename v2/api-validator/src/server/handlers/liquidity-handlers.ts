import { FastifyReply, FastifyRequest } from 'fastify';
import {
  EntityIdPathParam,
  ErrorType,
  Quote,
  QuoteCapability,
  QuoteRequest,
  SubAccountIdPathParam,
} from '../../client/generated';
import {
  ENDING_STARTING_COMBINATION_ERROR,
  InvalidPaginationParamsCombinationError,
  PaginationParams,
  getPaginationResult,
} from '../controllers/pagination-controller';
import {
  InvalidQuoteRequestError,
  QUOTE_CAPABILITIES,
  QuoteNotFoundError,
  addNewQuoteForUser,
  executeAccountQuote,
  getUserQuotes,
  quoteFromQuoteRequest,
  validateQuoteRequest,
} from '../controllers/liquidity-controller';
import { isKnownSubAccount } from '../controllers/accounts-controller';

export async function getQuoteCapabilities(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<{ capabilities: QuoteCapability[] }> {
  return { capabilities: QUOTE_CAPABILITIES };
}

export async function getQuotes(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<{ quotes: Quote[] }> {
  const { limit, startingAfter, endingBefore } = request.query as PaginationParams;
  const { accountId } = request.params as { accountId: SubAccountIdPathParam };

  if (!isKnownSubAccount(accountId)) {
    return reply
      .code(404)
      .send({ message: 'Sub account not found', errorType: ErrorType.NOT_FOUND });
  }

  try {
    const userQuotes = getUserQuotes(accountId);

    const result = getPaginationResult(limit, startingAfter, endingBefore, userQuotes, 'id');
    return { quotes: result };
  } catch (err) {
    if (err instanceof InvalidPaginationParamsCombinationError) {
      return reply.code(400).send(ENDING_STARTING_COMBINATION_ERROR);
    }
    throw err;
  }
}

export async function createQuote(request: FastifyRequest, reply: FastifyReply): Promise<Quote> {
  const { accountId } = request.params as { accountId: SubAccountIdPathParam };
  const quoteRequest = request.body as QuoteRequest;

  if (!isKnownSubAccount(accountId)) {
    return reply
      .code(404)
      .send({ message: 'Sub account not found', errorType: ErrorType.NOT_FOUND });
  }

  try {
    validateQuoteRequest(quoteRequest);
  } catch (err) {
    if (err instanceof InvalidQuoteRequestError) {
      return reply.code(400).send({
        message: err.message,
        errorType: err.errorType,
        requestPart: err.requestPart,
        propertyName: err.propertyName,
      });
    }
    throw err;
  }

  const quote = quoteFromQuoteRequest(quoteRequest);

  addNewQuoteForUser(accountId, quote);

  return quote;
}

export async function getQuoteDetails(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<Quote> {
  const { accountId, id: quoteId } = request.params as {
    accountId: SubAccountIdPathParam;
    id: EntityIdPathParam;
  };

  if (!isKnownSubAccount(accountId)) {
    return reply
      .code(404)
      .send({ message: 'Sub account not found', errorType: ErrorType.NOT_FOUND });
  }

  const accountQuotes = getUserQuotes(accountId);
  const quote = accountQuotes.find((quote) => quote.id === quoteId);

  if (!quote) {
    return reply.code(404).send({
      message: 'Quote not found',
      errorType: ErrorType.NOT_FOUND,
    });
  }

  return quote;
}

export async function executeQuote(request: FastifyRequest, reply: FastifyReply): Promise<Quote> {
  const { accountId, id: quoteId } = request.params as {
    accountId: SubAccountIdPathParam;
    id: EntityIdPathParam;
  };

  if (!isKnownSubAccount(accountId)) {
    return reply
      .code(404)
      .send({ message: 'Sub account not found', errorType: ErrorType.NOT_FOUND });
  }

  try {
    const executedQuote = executeAccountQuote(accountId, quoteId);
    return executedQuote;
  } catch (err) {
    if (err instanceof QuoteNotFoundError) {
      return reply.code(404).send({
        message: 'Quote not found',
        errorType: ErrorType.NOT_FOUND,
      });
    }
    throw err;
  }
}
