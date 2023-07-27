import { FastifyReply, FastifyRequest } from 'fastify';
import * as ErrorFactory from '../http-error-factory';
import { isKnownSubAccount } from '../controllers/accounts-controller';
import {
  EntityIdPathParam,
  Quote,
  QuoteCapability,
  QuoteRequest,
  SubAccountIdPathParam,
} from '../../client/generated';
import { PaginationParams, getPaginationResult } from '../controllers/pagination-controller';
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
    return ErrorFactory.notFound(reply);
  }

  const userQuotes = getUserQuotes(accountId);

  const result = getPaginationResult(limit, startingAfter, endingBefore, userQuotes, 'id');
  return { quotes: result };
}

export async function createQuote(request: FastifyRequest, reply: FastifyReply): Promise<Quote> {
  const { accountId } = request.params as { accountId: SubAccountIdPathParam };
  const quoteRequest = request.body as QuoteRequest;

  if (!isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
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
    return ErrorFactory.notFound(reply);
  }

  const accountQuotes = getUserQuotes(accountId);
  const quote = accountQuotes.find((quote) => quote.id === quoteId);

  if (!quote) {
    return ErrorFactory.notFound(reply);
  }

  return quote;
}

export async function executeQuote(request: FastifyRequest, reply: FastifyReply): Promise<Quote> {
  const { accountId, id: quoteId } = request.params as {
    accountId: SubAccountIdPathParam;
    id: EntityIdPathParam;
  };

  if (!isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
  }

  try {
    const executedQuote = executeAccountQuote(accountId, quoteId);
    return executedQuote;
  } catch (err) {
    if (err instanceof QuoteNotFoundError) {
      return ErrorFactory.notFound(reply);
    }
    throw err;
  }
}
