import { AssetReference, Quote, QuoteRequest, QuoteStatus } from '../../src/client/generated';
import { AssetsController } from '../../src/server/controllers/assets-controller';
import {
  LiquidityController,
  QuoteNotFoundError,
} from '../../src/server/controllers/liquidity-controller';

describe('Liquidity Controller', () => {
  let liquidityController: LiquidityController;
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

  beforeEach(() => {
    liquidityController = new LiquidityController(new AssetsController([]));
  });

  describe('executeAccountQuote', () => {
    beforeEach(() => {
      liquidityController.addNewQuoteForAccount(accountId, defaultQuote);
    });

    it('should set quote status to executed and return it', () => {
      const executedQuote = liquidityController.executeAccountQuote(accountId, defaultQuote.id);
      const retrievedExecutedQuote = liquidityController.getAccountQuote(
        accountId,
        defaultQuote.id
      );

      expect(executedQuote.status).toBe(QuoteStatus.EXECUTED);
      expect(executedQuote).toEqual(retrievedExecutedQuote);
    });

    describe('With non existing quote id', () => {
      const nonExistingQuoteId = 'non-existing-id';
      it('should throw quote not found error', () => {
        expect(() => {
          liquidityController.executeAccountQuote(accountId, nonExistingQuoteId);
        }).toThrow(QuoteNotFoundError);
      });
    });
  });

  describe('addNewQuoteForUser', () => {
    beforeEach(() => {
      liquidityController.addNewQuoteForAccount(accountId, defaultQuote);
    });

    describe('With empty mapping', () => {
      it('should find quote on accont quotes', () => {
        expect(liquidityController.getAccountQuotes(accountId)).toEqual([defaultQuote]);
      });
    });

    describe('With existing quotes for user', () => {
      const differentQuote = {
        ...defaultQuote,
        id: 'different-id',
      };
      beforeEach(() => {
        liquidityController.addNewQuoteForAccount(accountId, differentQuote);
      });
      it('should add quote to account quote list', () => {
        console.log(liquidityController.getAccountQuotes(accountId));
        expect(liquidityController.getAccountQuotes(accountId)).toEqual([
          defaultQuote,
          differentQuote,
        ]);
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
      const quote = liquidityController.quoteFromQuoteRequest(quoteRequest);
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

      const quoteWithFromAmount = liquidityController.quoteFromQuoteRequest(
        quoteRequestWithFromAmount
      );
      const quoteWithToAmount = liquidityController.quoteFromQuoteRequest(quoteRequestWithToAmount);

      expect(quoteWithFromAmount.toAmount).toBe(quoteRequestWithFromAmount.fromAmount);
      expect(quoteWithToAmount.fromAmount).toBe(quoteRequestWithToAmount.toAmount);
    });
  });
});
