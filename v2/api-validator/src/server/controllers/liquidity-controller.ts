import { randomUUID } from 'crypto';
import { Quote, QuoteRequest, QuoteStatus } from '../../client/generated';
import { XComError } from '../../error';

export class QuoteNotFoundError extends XComError {}

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

export function addNewQuoteForUser(
  accountId: string,
  quote: Quote,
  usersQuotesMap: Map<string, Quote[]>
): void {
  const accountQuotes = usersQuotesMap.get(accountId) ?? [];
  accountQuotes.push(quote);

  usersQuotesMap.set(accountId, accountQuotes);
}

export function executeAccountQuote(
  accountId: string,
  quoteId: string,
  usersQuotesMap: Map<string, Quote[]>
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
