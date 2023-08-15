import * as ErrorFactory from '../http-error-factory';
import { FastifyReply, FastifyRequest } from 'fastify';
import { getPaginationResult } from '../controllers/pagination-controller';
import { ControllersContainer } from '../controllers/controllers-container';
import { AccountIdPathParam, EntityIdPathParam, PaginationQuerystring } from './request-types';
import {
  BadRequestError,
  Quote,
  QuoteCapability,
  QuoteRequest,
  RequestPart,
} from '../../client/generated';
import {
  LiquidityController,
  QuoteNotFoundError,
  QuoteNotReadyError,
  UnknownFromAssetError,
  UnknownQuoteCapabilityError,
  UnknownToAssetError,
} from '../controllers/liquidity-controller';

type QuoteListResponse = { quotes: Quote[] };
type QuoteCapabilitiesResponse = { capabilities: QuoteCapability[] };
type QuoteRequestBody = { Body: QuoteRequest };

const controllers = new ControllersContainer(() => new LiquidityController());

export async function getQuoteCapabilities(): Promise<QuoteCapabilitiesResponse> {
  return { capabilities: LiquidityController.getQuoteCapabilities() };
}

export async function getQuotes(
  request: FastifyRequest<PaginationQuerystring & AccountIdPathParam>,
  reply: FastifyReply
): Promise<QuoteListResponse> {
  const { limit, startingAfter, endingBefore } = request.query;
  const { accountId } = request.params;

  const controller = controllers.getController(accountId);
  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  return {
    quotes: getPaginationResult(limit, startingAfter, endingBefore, controller.getQuotes(), 'id'),
  };
}

export async function createQuote(
  request: FastifyRequest<AccountIdPathParam & QuoteRequestBody>,
  reply: FastifyReply
): Promise<Quote> {
  const { accountId } = request.params;
  const quoteRequest = request.body;

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
  request: FastifyRequest<AccountIdPathParam & EntityIdPathParam>,
  reply: FastifyReply
): Promise<Quote> {
  const { accountId, id: quoteId } = request.params;

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

export async function executeQuote(
  request: FastifyRequest<AccountIdPathParam & EntityIdPathParam>,
  reply: FastifyReply
): Promise<Quote> {
  const { accountId, id: quoteId } = request.params;

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
