import { randomUUID } from 'crypto';
import {
  BadRequestError,
  Quote,
  QuoteCapability,
  QuoteRequest,
  QuoteStatus,
  RequestPart,
} from '../../client/generated';
import { XComError } from '../../error';
import { SUPPORTED_ASSETS, isKnownAsset } from './assets-controller';
import _ from 'lodash';

export class QuoteNotFoundError extends XComError {}
export class InvalidQuoteRequestError extends XComError {
  public requestPart = RequestPart.BODY;
  constructor(
    public message: string,
    public errorType: BadRequestError.errorType,
    public propertyName?: string
  ) {
    super(message);
  }
}

const USERS_QUOTES_MAP: Map<string, Quote[]> = new Map();

export const QUOTE_CAPABILITIES: QuoteCapability[] = [
  { fromAsset: { assetId: SUPPORTED_ASSETS[0].id }, toAsset: { assetId: SUPPORTED_ASSETS[1].id } },
  { fromAsset: { assetId: SUPPORTED_ASSETS[1].id }, toAsset: { assetId: SUPPORTED_ASSETS[0].id } },
];

function isSupportedLiquidityCapability(capability: QuoteCapability) {
  return QUOTE_CAPABILITIES.some((quoteCapability) => _.isEqual(quoteCapability, capability));
}

export function validateQuoteRequest(quoteRequest: QuoteRequest): void {
  if (!isKnownAsset(quoteRequest.fromAsset)) {
    throw new InvalidQuoteRequestError(
      'fromAsset is not a reference to a supported asset',
      BadRequestError.errorType.SCHEMA_PROPERTY_ERROR,
      'fromAsset'
    );
  }
  if (!isKnownAsset(quoteRequest.toAsset)) {
    throw new InvalidQuoteRequestError(
      'toAsset is not a reference to a supported asset',
      BadRequestError.errorType.SCHEMA_PROPERTY_ERROR,
      'toAsset'
    );
  }
  if (
    !isSupportedLiquidityCapability({
      fromAsset: quoteRequest.fromAsset,
      toAsset: quoteRequest.toAsset,
    })
  ) {
    throw new InvalidQuoteRequestError(
      `${quoteRequest.fromAsset}/${quoteRequest.toAsset} conversion is not supported`,
      BadRequestError.errorType.SCHEMA_ERROR
    );
  }
}

export function quoteFromQuoteRequest(quoteRequest: QuoteRequest): Quote {
  const { fromAsset, toAsset } = quoteRequest;
  let fromAmount;
  let toAmount;

  if ('fromAmount' in quoteRequest && quoteRequest.fromAmount) {
    fromAmount = toAmount = quoteRequest.fromAmount;
  }
  if ('toAmount' in quoteRequest && quoteRequest.toAmount) {
    toAmount = fromAmount = quoteRequest.toAmount;
  }
  return {
    fromAmount,
    toAmount,
    fromAsset,
    toAsset,
    conversionFeeBps: 1,
    createdAt: new Date(Date.now()).toISOString(),
    expiresAt: new Date(Date.now() + 1000).toISOString(),
    id: randomUUID(),
    status: QuoteStatus.READY,
  };
}

export function getUserQuotes(
  accountId: string,
  usersQuotesMap: Map<string, Quote[]> = USERS_QUOTES_MAP
): Quote[] {
  return usersQuotesMap.get(accountId) ?? [];
}

export function addNewQuoteForUser(
  accountId: string,
  quote: Quote,
  usersQuotesMap: Map<string, Quote[]> = USERS_QUOTES_MAP
): void {
  const accountQuotes = usersQuotesMap.get(accountId) ?? [];
  accountQuotes.push(quote);

  usersQuotesMap.set(accountId, accountQuotes);
}

export function executeAccountQuote(
  accountId: string,
  quoteId: string,
  usersQuotesMap: Map<string, Quote[]> = USERS_QUOTES_MAP
): Quote {
  const accountQuotes = usersQuotesMap.get(accountId) ?? [];
  const quoteIndex = accountQuotes.findIndex((quote) => quote.id === quoteId);
  if (quoteIndex === -1) {
    throw new QuoteNotFoundError('Requested quote to execute not found', { quoteId, accountId });
  }

  const executedQuote: Quote = { ...accountQuotes[quoteIndex], status: QuoteStatus.EXECUTED };

  accountQuotes[quoteIndex] = executedQuote;
  usersQuotesMap.set(accountId, accountQuotes);

  return executedQuote;
}
