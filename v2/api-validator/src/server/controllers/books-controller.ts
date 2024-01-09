import {
  Blockchain,
  CryptocurrencySymbol,
  MarketEntry,
  NationalCurrencyCode,
  OrderBook,
  OrderSide,
} from '../../client/generated';
import { AssetsController } from './assets-controller';
import { Repository } from './repository';

export const books: OrderBook[] = [
  {
    id: 'BTC/USDC',
    description: 'Bitcoin book',
    baseAsset: {
      blockchain: Blockchain.BITCOIN,
      cryptocurrencySymbol: CryptocurrencySymbol.BTC,
    },
    quoteAsset: {
      assetId: 'f0844d82-7097-4521-95bc-d843724a893e',
    },
  },
  {
    id: 'GBP/USDC',
    baseAsset: {
      nationalCurrencyCode: NationalCurrencyCode.GBP,
    },
    quoteAsset: {
      assetId: 'f0844d82-7097-4521-95bc-d843724a893e',
    },
  },
];

export const asks: Record<string, MarketEntry[]> = {
  'BTC/USDC': [
    {
      id: 'EADAC726-414B-4C5B-B26A-8A616446BDB0',
      price: '29312.03',
      amount: '9.21634',
      totalPrice: '270149.63',
      side: OrderSide.SELL,
    },
    {
      id: '23631CE5-123B-4163-A6CD-6BF3CE5521C6',
      price: '29315.97',
      amount: '22.33346',
      totalPrice: '654727.04',
      side: OrderSide.SELL,
    },
    {
      id: '375C2D0A-2874-4FCE-A860-068856D05A87',
      price: '29316.95',
      amount: '9.30764',
      totalPrice: '272871.62',
      side: OrderSide.SELL,
    },
    {
      id: 'E577CE57-57BE-49F4-ACA9-DA8EA0F560BD',
      price: '29317.14',
      amount: '7.56552',
      totalPrice: '221799.41',
      side: OrderSide.SELL,
    },
    {
      id: '92946569-74FE-42BD-9898-CBD03A5D407B',
      price: '29317.38',
      amount: '9.87465',
      totalPrice: '289498.87',
      side: OrderSide.SELL,
    },
  ],
};

export const bids: Record<string, MarketEntry[]> = {
  'BTC/USDC': [
    {
      id: 'F69C17BB-9E2A-4159-8938-8B142F55B4BE',
      price: '29312.03',
      amount: '9.21634',
      totalPrice: '270149.63',
      side: OrderSide.BUY,
    },
    {
      id: 'E7042B8A-D467-4144-AC53-92C4A96C2A84',
      price: '29310.42',
      amount: '0.00091',
      totalPrice: '26.67',
      side: OrderSide.BUY,
    },
    {
      id: '6A3444BC-34D1-411B-B505-ADE557307C62',
      price: '29310.35',
      amount: '0.027',
      totalPrice: '791.38',
      side: OrderSide.BUY,
    },
    {
      id: '27C49660-AC51-409D-A6C9-5E5BB0FFFACE',
      price: '29310.34',
      amount: '0.4275',
      totalPrice: '12530.17',
      side: OrderSide.BUY,
    },
    {
      id: 'E776FAF0-B9BB-414B-8519-CB01D088FAC2',
      price: '29310.27',
      amount: '0.01412',
      totalPrice: '413.86',
      side: OrderSide.BUY,
    },
  ],
};

type BookMarketEntries = { id: string; entries: MarketEntry[] };

export class BooksController {
  private static readonly booksRepository = new Repository<OrderBook>();
  private static readonly asksRepository = new Repository<BookMarketEntries>();
  private static readonly bidsRepository = new Repository<BookMarketEntries>();
  private static booksLoaded = false;

  public static loadBooks(): void {
    const assetId = AssetsController.getAllAdditionalAssets()[0].id;
    for (const book of books) {
      book.quoteAsset = { assetId };
      this.booksRepository.create(book);
    }

    for (const id in asks) {
      this.asksRepository.create({ id, entries: asks[id] });
    }

    for (const id in bids) {
      this.bidsRepository.create({ id, entries: bids[id] });
    }
    this.booksLoaded = true;
  }

  public static getAllBooks(): OrderBook[] {
    return this.booksRepository.list();
  }

  public static getBook(id: string): OrderBook | undefined {
    return this.booksRepository.find(id);
  }

  public static getAsks(id: string): MarketEntry[] {
    return this.asksRepository.find(id)?.entries ?? [];
  }

  public static getBids(id: string): MarketEntry[] {
    return this.bidsRepository.find(id)?.entries ?? [];
  }
}
