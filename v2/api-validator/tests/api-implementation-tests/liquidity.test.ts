import { randomUUID } from 'crypto';
import Client from '../../src/client';
import {
  Account,
  ApiError,
  BadRequestError,
  NationalCurrencyCode,
  Quote,
  QuoteCapabilities,
  QuoteCapability,
  QuoteRequest,
  QuoteStatus,
  RequestPart,
} from '../../src/client/generated';
import config from '../../src/config';
import { AssetsDirectory } from '../utils/assets-directory';
import { Pageable, paginated } from '../utils/pagination';

const liquidityCapability = config.get('capabilities.components.liquidity');

describe.skipIf(!liquidityCapability)('Liquidity', () => {
  let client: Client;
  let assets: AssetsDirectory;
  let capabilitiesResponse: QuoteCapabilities;
  let account: Account;

  beforeAll(async () => {
    client = new Client();
    assets = await AssetsDirectory.fetch();
    account = await getLiquidityCapableAccount();
    capabilitiesResponse = await client.capabilities.getQuoteCapabilities({});
  });

  describe('Capabilities', () => {
    it('should use known assets only', async () => {
      let capabilityCount = 0;

      const isKnownAsset = assets.isKnownAsset.bind(assets);

      for (const liquidityCapability of capabilitiesResponse.capabilities) {
        capabilityCount++;
        expect(liquidityCapability.fromAsset).toSatisfy(isKnownAsset);
        expect(liquidityCapability.toAsset).toSatisfy(isKnownAsset);
      }

      expect(capabilityCount).toBeGreaterThan(0);
    });
  });

  describe('Create quote', () => {
    let capability: QuoteCapability;

    beforeAll(() => {
      console.log(capabilitiesResponse);
      capability = capabilitiesResponse.capabilities[0];
    });

    const getCreateQuoteSuccessResult = async (requestBody: QuoteRequest): Promise<Quote> => {
      return await client.liquidity.createQuote({
        accountId: account.id,
        requestBody,
      });
    };

    const getCreateQuoteFailureResult = async (requestBody: QuoteRequest): Promise<ApiError> => {
      try {
        await client.liquidity.createQuote({
          accountId: account.id,
          requestBody,
        });
      } catch (err) {
        if (err instanceof ApiError) {
          return err;
        }
        throw err;
      }
      throw new Error('Expected to throw');
    };

    it('should succeed with only fromAmount', async () => {
      const quote = await getCreateQuoteSuccessResult({ ...capability, fromAmount: '1' });
      expect(quote.status).toBe(QuoteStatus.READY);
    });

    it('should succeed with only toAmount', async () => {
      const quote = await getCreateQuoteSuccessResult({ ...capability, toAmount: '1' });
      expect(quote.status).toBe(QuoteStatus.READY);
    });

    it('should fail with using both fromAmount and toAmount', async () => {
      const error = await getCreateQuoteFailureResult({
        ...capability,
        fromAmount: '1',
        toAmount: '1',
      });

      expect(error.status).toBe(400);
      expect(error.body.errorType).toBe(BadRequestError.errorType.SCHEMA_ERROR);
      expect(error.body.requestPart).toBe(RequestPart.BODY);
    });

    it('should fail with unknown fromAsset', async () => {
      const error = await getCreateQuoteFailureResult({
        ...capability,
        fromAsset: { assetId: randomUUID() },
        toAmount: '1',
      });

      expect(error.status).toBe(400);
      expect(error.body.errorType).toBe(BadRequestError.errorType.SCHEMA_PROPERTY_ERROR);
      expect(error.body.requestPart).toBe(RequestPart.BODY);
      expect(error.body.propertyName).toBe('fromAsset');
    });

    it('should fail with unknown toAsset', async () => {
      const error = await getCreateQuoteFailureResult({
        ...capability,
        toAsset: { assetId: randomUUID() },
        toAmount: '1',
      });

      expect(error.status).toBe(400);
      expect(error.body.errorType).toBe(BadRequestError.errorType.SCHEMA_PROPERTY_ERROR);
      expect(error.body.requestPart).toBe(RequestPart.BODY);
      expect(error.body.propertyName).toBe('toAsset');
    });

    it('should failure when using a fromAsset and toAsset permutation which is not listed from quote capabilities', async () => {
      const unsupportedPair: QuoteCapability = {
        fromAsset: { nationalCurrencyCode: NationalCurrencyCode.USD },
        toAsset: { nationalCurrencyCode: NationalCurrencyCode.USD },
      };

      const error = await getCreateQuoteFailureResult({
        ...unsupportedPair,
        toAmount: '1',
      });

      expect(error.status).toBe(400);
      expect(error.body.errorType).toBe(BadRequestError.errorType.SCHEMA_ERROR);
      expect(error.body.requestPart).toBe(RequestPart.BODY);
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

  describe('List quotes', () => {
    const getQuotes: Pageable<Quote> = async (limit, startingAfter?) => {
      const response = await client.liquidity.getQuotes({
        accountId: account.id,
        limit,
        startingAfter,
      });
      return response.quotes;
    };

    it('should use known assets only', async () => {
      const isKnownAsset = assets.isKnownAsset.bind(assets);

      for await (const quote of paginated(getQuotes)) {
        expect(quote.fromAsset).toSatisfy(isKnownAsset);
        expect(quote.toAsset).toSatisfy(isKnownAsset);
      }
    });
  });
});

async function getLiquidityCapableAccount(): Promise<Account> {
  const capabilitiesLiquidity = config.get('capabilities.components.liquidity');
  const client = new Client();
  let accountId: string;
  if (Array.isArray(capabilitiesLiquidity)) {
    accountId = capabilitiesLiquidity[0];
  } else {
    const accounts = await client.accounts.getAccounts({});
    accountId = accounts.accounts[0].id;
  }
  return await client.accounts.getAccountDetails({ accountId });
}
