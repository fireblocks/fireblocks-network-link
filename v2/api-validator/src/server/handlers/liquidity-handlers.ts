import { FastifyReply, FastifyRequest } from 'fastify';
import {
  EntityIdPathParam,
  ErrorType,
  Quote,
  QuoteCapability,
  QuoteRequest,
  SubAccountIdPathParam,
} from '../../client/generated';
import { SUPPORTED_ASSETS } from './additional-assets-handler';
import {
  ENDING_STARTING_COMBINATION_ERROR,
  InvalidPaginationParamsCombinationError,
  PaginationParams,
  getPaginationResult,
} from '../controllers/pagination-controller';
import {
  QuoteNotFoundError,
  addNewQuoteForUser,
  executeAccountQuote,
  quoteFromQuoteRequest,
} from '../controllers/liquidity-controller';

const QUOTE_CAPABILITIES: QuoteCapability[] = [
  { fromAsset: { assetId: SUPPORTED_ASSETS[0].id }, toAsset: { assetId: SUPPORTED_ASSETS[1].id } },
  { fromAsset: { assetId: SUPPORTED_ASSETS[1].id }, toAsset: { assetId: SUPPORTED_ASSETS[0].id } },
];

const USERS_QUOTES_MAP: Map<string, Quote[]> = new Map();

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
  const paginationParams = request.query as PaginationParams;
  const params = request.params as { accountId: SubAccountIdPathParam };

  try {
    const userQuotes = USERS_QUOTES_MAP.get(params.accountId) ?? [];

    const result = getPaginationResult(
      paginationParams.limit,
      paginationParams.startingAfter,
      paginationParams.endingBefore,
      userQuotes,
      'id'
    );
    return { quotes: result };
  } catch (err) {
    if (err instanceof InvalidPaginationParamsCombinationError) {
      return reply.code(400).send(ENDING_STARTING_COMBINATION_ERROR);
    }
    return reply.code(500).send({ errorType: ErrorType.INTERNAL_ERROR });
  }
}

export async function createQuote(request: FastifyRequest, reply: FastifyReply): Promise<Quote> {
  const params = request.params as { accountId: SubAccountIdPathParam };
  const quoteRequest = request.body as QuoteRequest;

  const quote = quoteFromQuoteRequest(quoteRequest);

  addNewQuoteForUser(params.accountId, quote, USERS_QUOTES_MAP);

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

  const accountQuotes = USERS_QUOTES_MAP.get(accountId) ?? [];
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
  try {
    const executedQuote = executeAccountQuote(accountId, quoteId, USERS_QUOTES_MAP);
    return executedQuote;
  } catch (err) {
    if (err instanceof QuoteNotFoundError) {
      return reply.code(404).send({
        message: 'Quote not found',
        errorType: ErrorType.NOT_FOUND,
      });
    }
    return reply.code(500).send({ errorType: ErrorType.INTERNAL_ERROR });
  }
}
