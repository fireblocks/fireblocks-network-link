import * as ErrorFactory from '../http-error-factory';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ControllersContainer } from '../controllers/controllers-container';
import { PaginationParams, getPaginationResult } from '../controllers/pagination-controller';
import {
  BadRequestError,
  EntityIdPathParam,
  Quote,
  QuoteCapability,
  QuoteRequest,
  RequestPart,
  SubAccountIdPathParam,
} from '../../client/generated';
import {
  LiquidityController,
  QuoteNotFoundError,
  QuoteNotReadyError,
  UnknownFromAssetError,
  UnknownQuoteCapabilityError,
  UnknownToAssetError,
} from '../controllers/liquidity-controller';

const controllers = new ControllersContainer(() => new LiquidityController());

export async function getQuoteCapabilities(): Promise<{ capabilities: QuoteCapability[] }> {
  return { capabilities: LiquidityController.getQuoteCapabilities() };
}

export async function getQuotes(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<{ quotes: Quote[] }> {
  const { limit, startingAfter, endingBefore } = request.query as PaginationParams;
  const { accountId } = request.params as { accountId: SubAccountIdPathParam };

  const controller = controllers.getController(accountId);
  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  return {
    quotes: getPaginationResult(limit, startingAfter, endingBefore, controller.getQuotes(), 'id'),
  };
}

export async function createQuote(request: FastifyRequest, reply: FastifyReply): Promise<Quote> {
  const { accountId } = request.params as { accountId: SubAccountIdPathParam };
  const quoteRequest = request.body as QuoteRequest;

  const controller = controllers.getController(accountId);
  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  try {
    controller.validateQuoteRequest(quoteRequest);
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

  const quote = controller.quoteFromQuoteRequest(quoteRequest);

  controller.createQuote(quote);

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

  const controller = controllers.getController(accountId);
  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  try {
    return controller.getQuote(quoteId);
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

  const controller = controllers.getController(accountId);
  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  try {
    const executedQuote = controller.executeQuote(quoteId);
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
