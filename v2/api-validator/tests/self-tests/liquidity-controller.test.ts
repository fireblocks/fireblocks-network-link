import { AssetReference, Quote, QuoteRequest, QuoteStatus } from '../../src/client/generated';
import {
  QuoteNotFoundError,
  addNewQuoteForUser,
  executeAccountQuote,
  quoteFromQuoteRequest,
} from '../../src/server/controllers/liquidity-controller';

describe('Liquidity Controller', () => {
  const accountId = 'accountId';
  const defaultAmount = '1';
  const defaultAssetReference: AssetReference = { assetId: 'assetId' };
  const defaultQuote: Quote = {
    fromAmount: defaultAmount,
    toAmount: defaultAmount,
    fromAsset: defaultAssetReference,
    toAsset: defaultAssetReference,
    conversionFeeBps: 1,
    createdAt: new Date(Date.now()).toISOString(),
    expiresAt: new Date(Date.now() + 1000).toISOString(),
    id: 'id',
    status: QuoteStatus.READY,
  };
  let usersQuotesMapping: Map<string, Quote[]> = new Map();

  afterEach(() => {
    usersQuotesMapping = new Map();
  });

  describe('executeAccountQuote', () => {
    beforeEach(() => {
      usersQuotesMapping.set(accountId, [defaultQuote]);
    });

    it('should set quote status to executed and return it', () => {
      const executedQuote = executeAccountQuote(accountId, defaultQuote.id, usersQuotesMapping);
      const executedQuoteFromMap = usersQuotesMapping
        .get(accountId)
        ?.find((quote) => quote.id === defaultQuote.id);

      expect(executedQuoteFromMap?.status).toBe(QuoteStatus.EXECUTED);
      expect(executedQuote).toBe(executedQuoteFromMap);
    });

    describe('With non existing quote id', () => {
      const nonExistingQuoteId = 'non-existing-id';
      it('should throw quote not found error', () => {
        expect(() => {
          executeAccountQuote(accountId, nonExistingQuoteId, usersQuotesMapping);
        }).toThrow(QuoteNotFoundError);
      });
    });
  });

  describe('addNewQuoteForUser', () => {
    beforeEach(() => {
      addNewQuoteForUser(accountId, defaultQuote, usersQuotesMapping);
    });

    describe('With empty mapping', () => {
      it('should set array with new quote as a single item for the account', () => {
        expect(usersQuotesMapping.get(accountId)).toEqual([defaultQuote]);
      });
    });

    describe('With existing quotes for user', () => {
      beforeAll(() => {
        usersQuotesMapping.set(accountId, [defaultQuote]);
      });
      it('should add quote to account quote list', () => {
        expect(usersQuotesMapping.get(accountId)).toEqual([defaultQuote, defaultQuote]);
      });
    });
  });

  describe('quoteFromQuoteRequest', () => {
    it('should return quote with ready status', () => {
      const quoteRequest: QuoteRequest = {
        fromAsset: defaultAssetReference,
        toAsset: defaultAssetReference,
        fromAmount: defaultAmount,
        toAmount: defaultAmount,
      };
      const quote = quoteFromQuoteRequest(quoteRequest);
      expect(quote.status).toBe(QuoteStatus.READY);
    });

    it('should mirror fromAmount and toAmount to each other', () => {
      const quoteRequestWithFromAmount: QuoteRequest = {
        fromAsset: defaultAssetReference,
        toAsset: defaultAssetReference,
        fromAmount: defaultAmount,
      };

      const quoteRequestWithToAmount: QuoteRequest = {
        fromAsset: defaultAssetReference,
        toAsset: defaultAssetReference,
        toAmount: defaultAmount,
      };

      const quoteWithFromAmount = quoteFromQuoteRequest(quoteRequestWithFromAmount);
      const quoteWithToAmount = quoteFromQuoteRequest(quoteRequestWithToAmount);

      expect(quoteWithFromAmount.toAmount).toBe(quoteRequestWithFromAmount.fromAmount);
      expect(quoteWithToAmount.fromAmount).toBe(quoteRequestWithToAmount.toAmount);
    });
  });
});
