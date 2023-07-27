import { randomUUID } from 'crypto';
import {
  NationalCurrencyCode,
  Quote,
  QuoteCapability,
  QuoteRequest,
  QuoteStatus,
} from '../../client/generated';
import { XComError } from '../../error';
import { SUPPORTED_ASSETS, isKnownAsset } from './assets-controller';
import _ from 'lodash';

export class QuoteNotFoundError extends XComError {
  constructor() {
    super('Quote not found');
  }
}
export class QuoteNotReadyError extends XComError {
  constructor() {
    super('Quote not ready');
  }
}
export class UnknownFromAssetError extends XComError {
  constructor() {
    super('Unknown fromAsset');
  }
}
export class UnknownToAssetError extends XComError {
  constructor() {
    super('Unknown toAsset');
  }
}
export class UnknownQuoteCapabilityError extends XComError {
  constructor({ fromAsset, toAsset }: QuoteCapability) {
    super('Converstion not supported', { fromAsset, toAsset });
  }
}

const QUOTE_EXPIRATION_IN_MS = 1000;

const ACCOUNTS_QUOTES_MAP: Map<string, Quote[]> = new Map();

export const QUOTE_CAPABILITIES: QuoteCapability[] = [
  { fromAsset: { assetId: SUPPORTED_ASSETS[0].id }, toAsset: { assetId: SUPPORTED_ASSETS[1].id } },
  { fromAsset: { assetId: SUPPORTED_ASSETS[1].id }, toAsset: { assetId: SUPPORTED_ASSETS[0].id } },
  {
    fromAsset: { nationalCurrencyCode: NationalCurrencyCode.USD },
    toAsset: { nationalCurrencyCode: NationalCurrencyCode.MXN },
  },
];

function isKnownLiquidityCapability(capability: QuoteCapability) {
  return QUOTE_CAPABILITIES.some((quoteCapability) => _.isEqual(quoteCapability, capability));
}

export function validateQuoteRequest(quoteRequest: QuoteRequest): void {
  if (!isKnownAsset(quoteRequest.fromAsset)) {
    throw new UnknownFromAssetError();
  }
  if (!isKnownAsset(quoteRequest.toAsset)) {
    throw new UnknownToAssetError();
  }
  if (
    !isKnownLiquidityCapability({
      fromAsset: quoteRequest.fromAsset,
      toAsset: quoteRequest.toAsset,
    })
  ) {
    throw new UnknownQuoteCapabilityError({
      fromAsset: quoteRequest.fromAsset,
      toAsset: quoteRequest.toAsset,
    });
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
    expiresAt: new Date(Date.now() + QUOTE_EXPIRATION_IN_MS).toISOString(),
    id: randomUUID(),
    status: QuoteStatus.READY,
  };
}

export function getAccountQuotes(
  accountId: string,
  accountsQuotesMap: Map<string, Quote[]> = ACCOUNTS_QUOTES_MAP
): Quote[] {
  return accountsQuotesMap.get(accountId) ?? [];
}

export function addNewQuoteForAccount(
  accountId: string,
  quote: Quote,
  accountsQuotesMap: Map<string, Quote[]> = ACCOUNTS_QUOTES_MAP
): void {
  const accountQuotes = accountsQuotesMap.get(accountId) ?? [];
  accountQuotes.push(quote);

  accountsQuotesMap.set(accountId, accountQuotes);
}

export function executeAccountQuote(
  accountId: string,
  quoteId: string,
  accountsQuotesMap: Map<string, Quote[]> = ACCOUNTS_QUOTES_MAP
): Quote {
  const accountQuotes = accountsQuotesMap.get(accountId) ?? [];
  const quoteIndex = accountQuotes.findIndex((quote) => quote.id === quoteId);
  if (quoteIndex === -1) {
    throw new QuoteNotFoundError();
  }

  if (accountQuotes[quoteIndex].status !== QuoteStatus.READY) {
    throw new QuoteNotReadyError();
  }

  const executedQuote: Quote = { ...accountQuotes[quoteIndex], status: QuoteStatus.EXECUTED };

  accountQuotes[quoteIndex] = executedQuote;
  accountsQuotesMap.set(accountId, accountQuotes);

  return executedQuote;
}
