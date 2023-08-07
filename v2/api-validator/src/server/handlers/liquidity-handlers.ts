import { FastifyReply, FastifyRequest } from 'fastify';
import * as ErrorFactory from '../http-error-factory';
import { accountsController } from '../controllers/accounts-controller';
import {
  BadRequestError,
  EntityIdPathParam,
  Quote,
  QuoteCapability,
  QuoteRequest,
  RequestPart,
  SubAccountIdPathParam,
} from '../../client/generated';
import { PaginationParams, getPaginationResult } from '../controllers/pagination-controller';
import {
  QUOTE_CAPABILITIES,
  QuoteNotFoundError,
  QuoteNotReadyError,
  UnknownFromAssetError,
  UnknownQuoteCapabilityError,
  UnknownToAssetError,
  liquidityController,
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

  if (!accountsController.isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
  }

  const accountQuotes = liquidityController.getAccountQuotes(accountId);

  const result = getPaginationResult(limit, startingAfter, endingBefore, accountQuotes, 'id');
  return { quotes: result };
}

export async function createQuote(request: FastifyRequest, reply: FastifyReply): Promise<Quote> {
  const { accountId } = request.params as { accountId: SubAccountIdPathParam };
  const quoteRequest = request.body as QuoteRequest;

  if (!accountsController.isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
  }

  try {
    liquidityController.validateQuoteRequest(quoteRequest);
  } catch (err) {
    if (err instanceof UnknownFromAssetError) {
      return ErrorFactory.badRequest(reply, {
        message: err.message,
        errorType: BadRequestError.errorType.UNKNOWN_ASSET,
        requestPart: RequestPart.BODY,
        propertyName: 'fromAsset',
      });
    }
    if (err instanceof UnknownToAssetError) {
      return ErrorFactory.badRequest(reply, {
        message: err.message,
        errorType: BadRequestError.errorType.UNKNOWN_ASSET,
        requestPart: RequestPart.BODY,
        propertyName: 'toAsset',
      });
    }
    if (err instanceof UnknownQuoteCapabilityError) {
      return ErrorFactory.badRequest(reply, {
        message: err.message,
        errorType: BadRequestError.errorType.UNSUPPORTED_CONVERSION,
        requestPart: RequestPart.BODY,
      });
    }
    throw err;
  }

  const quote = liquidityController.quoteFromQuoteRequest(quoteRequest);

  liquidityController.addNewQuoteForAccount(accountId, quote);

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

  if (!accountsController.isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
  }

  try {
    return liquidityController.getAccountQuote(accountId, quoteId);
  } catch (err) {
    if (err instanceof QuoteNotFoundError) {
      ErrorFactory.notFound(reply);
    }
    throw err;
  }
}

export async function executeQuote(request: FastifyRequest, reply: FastifyReply): Promise<Quote> {
  const { accountId, id: quoteId } = request.params as {
    accountId: SubAccountIdPathParam;
    id: EntityIdPathParam;
  };

  if (!accountsController.isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
  }

  try {
    const executedQuote = liquidityController.executeAccountQuote(accountId, quoteId);
    return executedQuote;
  } catch (err) {
    if (err instanceof QuoteNotFoundError) {
      return ErrorFactory.notFound(reply);
    }
    if (err instanceof QuoteNotReadyError) {
      return ErrorFactory.badRequest(reply, {
        message: err.message,
        errorType: BadRequestError.errorType.QUOTE_NOT_READY,
      });
    }
    throw err;
  }
}
