import { randomUUID } from 'crypto';
import {
  NationalCurrencyCode,
  Quote,
  QuoteCapability,
  QuoteRequest,
  QuoteStatus,
} from '../../client/generated';
import { XComError } from '../../error';
import { AssetsController, SUPPORTED_ASSETS, assetsController } from './assets-controller';
import _ from 'lodash';
import { Repository } from './repository';

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

type AccountQuote = { id: string; accountId: string; data: Quote };

const QUOTE_EXPIRATION_IN_MS = 1000;

export const QUOTE_CAPABILITIES: QuoteCapability[] = [
  { fromAsset: { assetId: SUPPORTED_ASSETS[0].id }, toAsset: { assetId: SUPPORTED_ASSETS[1].id } },
  { fromAsset: { assetId: SUPPORTED_ASSETS[1].id }, toAsset: { assetId: SUPPORTED_ASSETS[0].id } },
  {
    fromAsset: { nationalCurrencyCode: NationalCurrencyCode.USD },
    toAsset: { nationalCurrencyCode: NationalCurrencyCode.MXN },
  },
];

export class LiquidityController {
  private readonly quoteRepository = new Repository<AccountQuote>();

  constructor(private assetsController: AssetsController) {}

  private isKnownLiquidityCapability(capability: QuoteCapability) {
    return QUOTE_CAPABILITIES.some((quoteCapability) => _.isEqual(quoteCapability, capability));
  }

  public validateQuoteRequest(quoteRequest: QuoteRequest): void {
    if (!this.assetsController.isKnownAsset(quoteRequest.fromAsset)) {
      throw new UnknownFromAssetError();
    }
    if (!this.assetsController.isKnownAsset(quoteRequest.toAsset)) {
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

  public getAccountQuotes(accountId: string): Quote[] {
    const allQuotes = this.quoteRepository.list();
    const accountQuotes = allQuotes.filter((aq) => aq.accountId === accountId);
    return accountQuotes.map((aq) => aq.data);
  }

  public getAccountQuote(accountId: string, quoteId: string): Quote {
    const accountQuote = this.quoteRepository.find(quoteId);

    if (!accountQuote || accountQuote.accountId !== accountId) {
      throw new QuoteNotFoundError();
    }

    return accountQuote.data;
  }

  public addNewQuoteForAccount(accountId: string, quote: Quote): void {
    this.quoteRepository.create({ id: quote.id, accountId, data: quote });
  }

  public executeAccountQuote(accountId: string, quoteId: string): Quote {
    const accountQuote = this.quoteRepository.find(quoteId);

    if (!accountQuote || accountQuote.accountId !== accountId) {
      throw new QuoteNotFoundError();
    }

    if (accountQuote.data.status !== QuoteStatus.READY) {
      throw new QuoteNotReadyError();
    }

    accountQuote.data.status = QuoteStatus.EXECUTED;

    return accountQuote.data;
  }
}

export const liquidityController = new LiquidityController(assetsController);
