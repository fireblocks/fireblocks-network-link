import { randomUUID } from 'crypto';
import {
  AssetReference,
  Quote,
  QuoteCapability,
  QuoteRequest,
  QuoteStatus,
} from '../../client/generated';
import { XComError } from '../../error';
import { AssetsController } from './assets-controller';
import _ from 'lodash';
import { Repository } from './repository';
import { fakeSchemaObject } from '../../schemas';
import { JSONSchemaFaker } from 'json-schema-faker';

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
  constructor({ fromAsset, toAsset }: QuoteCapabilityAssets) {
    super('Converstion not supported', { fromAsset, toAsset });
  }
}

type QuoteCapabilityAssets = {
  fromAsset: AssetReference;
  toAsset: AssetReference;
};

const QUOTE_EXPIRATION_IN_MS = 1000;
const QUOTES_COUNT = 5;
const QUOTE_CAPABILITIES_COUNT = 5;

export class LiquidityController {
  private readonly quoteRepository = new Repository<Quote>();
  private static readonly quoteCapabilityRepository = new Repository<QuoteCapability>();
  private static loadedCapabilities = false;

  constructor() {
    for (let i = 0; i < QUOTES_COUNT; i++) {
      this.quoteRepository.create(fakeSchemaObject('Quote') as Quote);
    }

    const knownAssetIds = AssetsController.getAllAdditionalAssets().map((a) => a.id);
    injectKnownAssetIdsToQuoteAssetObjects(knownAssetIds, this.quoteRepository);
  }

  private isKnownLiquidityCapability(capability: QuoteCapabilityAssets) {
    return LiquidityController.quoteCapabilityRepository
      .list()
      .some((quoteCapability) => _.isMatch(quoteCapability, capability));
  }

  public validateQuoteRequest(quoteRequest: QuoteRequest): void {
    if (!AssetsController.isKnownAsset(quoteRequest.fromAsset)) {
      throw new UnknownFromAssetError();
    }
    if (!AssetsController.isKnownAsset(quoteRequest.toAsset)) {
      throw new UnknownToAssetError();
    }
    if (
      !this.isKnownLiquidityCapability({
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

  public quoteFromQuoteRequest(quoteRequest: QuoteRequest): Quote {
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

  public static getQuoteCapabilities(): QuoteCapability[] {
    if (!this.loadedCapabilities) {
      for (let i = 0; i < QUOTE_CAPABILITIES_COUNT; i++) {
        this.quoteCapabilityRepository.create(
          fakeSchemaObject('QuoteCapability') as QuoteCapability
        );
      }
      const knownAssetIds = AssetsController.getAllAdditionalAssets().map((a) => a.id);
      injectKnownAssetIdsToQuoteAssetObjects(knownAssetIds, this.quoteCapabilityRepository);
      this.loadedCapabilities = true;
    }
    return this.quoteCapabilityRepository.list();
  }

  public getQuotes(): Quote[] {
    return this.quoteRepository.list();
  }

  public getQuote(quoteId: string): Quote {
    const quote = this.quoteRepository.find(quoteId);

    if (!quote) {
      throw new QuoteNotFoundError();
    }

    return quote;
  }

  public createQuote(quote: Quote): void {
    this.quoteRepository.create(quote);
  }

  public executeQuote(quoteId: string): Quote {
    const quote = this.quoteRepository.find(quoteId);

    if (!quote) {
      throw new QuoteNotFoundError();
    }
    if (quote.status !== QuoteStatus.READY) {
      throw new QuoteNotReadyError();
    }

    quote.status = QuoteStatus.EXECUTED;
    return quote;
  }
}

function injectKnownAssetIdsToQuoteAssetObjects(
  knownAssetIds: string[],
  repository: Repository<Quote | QuoteCapability>
) {
  for (const { id } of repository.list()) {
    const quote = repository.find(id);

    if (!quote) {
      throw new Error('Not possible!');
    }

    if ('assetId' in quote.fromAsset) {
      quote.fromAsset.assetId = JSONSchemaFaker.random.pick(knownAssetIds);
    }
    if ('assetId' in quote.toAsset) {
      quote.toAsset.assetId = JSONSchemaFaker.random.pick(knownAssetIds);
    }
  }
}
