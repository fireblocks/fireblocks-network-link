import Client from '../../src/client';
import {
  Account,
  Quote,
  QuoteCapabilities,
  QuoteRequest,
  QuoteStatus,
} from '../../src/client/generated';
import config from '../../src/config';
import { describeif } from '../conditional-tests';

const shouldTestLiquidity = !!config.get('capabilities.components.liquidity');

describeif(shouldTestLiquidity, 'Liquidity', () => {
  let client: Client;
  let capabilitiesResponse: QuoteCapabilities;
  let account: Account;

  beforeAll(async () => {
    client = new Client();
    capabilitiesResponse = await client.capabilities.getQuoteCapabilities({});
  });

  describe('Capabilities', () => {
    it('every capability should have valid asset reference in from and to assets', () => {
      // TODO
    });
  });

  describe('List quotes', () => {
    let allQuotes: Quote[];

    beforeAll(async () => {
      allQuotes = await getAllQuotes();
    });

    it('every quote should be found on getQuoteDetails', async () => {
      // TODO
    });
  });

  describe('Create quote', () => {
    describe('With valid request', () => {
      let createdQuote: Quote;
      let quoteRequest: QuoteRequest;

      afterEach(async () => {
        // TODO: check quote is found on getQuoteDetails
      });
      it('should work with fromAmount', async () => {
        expect(async () => {
          await client.liquidity.createQuote(quoteRequest);
        }).not.toThrow();
      });
      it('should work with toAmount', () => {
        // TODO
      });
    });

    describe('With invalid request', () => {
      it('should fail when specifying fromAmount and toAmount', () => {
        // TODO
      });
      it('should fail when using invalid asset in either fromAsset or toAsset', () => {
        // TODO
      });
    });
  });

  describe('Execute quote', () => {
    let executedQuote: Quote;

    beforeAll(async () => {
      const createdQuote = await client.liquidity.createQuote({ accountId: account.id });
      executedQuote = await client.liquidity.executeQuote({
        id: createdQuote.id,
        accountId: account.id,
      });
    });

    it('should have quote status changed to executing / executed', () => {
      expect([QuoteStatus.EXECUTED, QuoteStatus.EXECUTING]).toContain(executedQuote.status);
    });

    it('should find quote on getQuoteDetails post execution', () => {
      // TODO
    });
  });
});
