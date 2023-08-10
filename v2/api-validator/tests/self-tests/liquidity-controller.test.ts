import { AssetReference, Quote, QuoteRequest, QuoteStatus } from '../../src/client/generated';
import {
  LiquidityController,
  QuoteNotFoundError,
} from '../../src/server/controllers/liquidity-controller';

describe('Liquidity Controller', () => {
  let liquidityController: LiquidityController;
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
    liquidityController = new LiquidityController();
  });

  describe('executeAccountQuote', () => {
    beforeEach(() => {
      liquidityController.createQuote(defaultQuote);
    });

    it('should set quote status to executed and return it', () => {
      const executedQuote = liquidityController.executeQuote(defaultQuote.id);
      const retrievedExecutedQuote = liquidityController.getQuote(defaultQuote.id);

      expect(executedQuote.status).toBe(QuoteStatus.EXECUTED);
      expect(executedQuote).toEqual(retrievedExecutedQuote);
    });

    describe('With non existing quote id', () => {
      const nonExistingQuoteId = 'non-existing-id';
      it('should throw quote not found error', () => {
        expect(() => {
          liquidityController.executeQuote(nonExistingQuoteId);
        }).toThrow(QuoteNotFoundError);
      });
    });
  });

  describe('addNewQuoteForUser', () => {
    beforeEach(() => {
      liquidityController.createQuote(defaultQuote);
    });

    describe('With empty mapping', () => {
      it('should find quote', () => {
        expect(liquidityController.getQuote(defaultQuote.id)).toEqual(defaultQuote);
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
