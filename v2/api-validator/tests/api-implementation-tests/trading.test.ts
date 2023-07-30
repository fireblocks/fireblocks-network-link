import config from '../../src/config';
import ApiClient from '../../src/client';
import { OrderBook } from '../../src/client/generated';
import { Pageable, paginated } from '../utils/pagination';
import { AssetsDirectory } from '../utils/assets-directory';

const tradingCapability = config.get('capabilities').components.trading;

describe.skipIf(!tradingCapability)('Trading API tests', () => {
  const client = new ApiClient();
  let assets: AssetsDirectory;

  const getBooks: Pageable<OrderBook> = async (limit, startingAfter?) => {
    const response = await client.capabilities.getBooks({ limit, startingAfter });
    return response.books;
  };

  beforeAll(async () => {
    assets = await AssetsDirectory.fetch();
  });

  describe('getBooks, getBookDetails', () => {
    it('books should use known assets only', async () => {
      let booksCount = 0;

      const isKnownAsset = assets.isKnownAsset.bind(assets);

      for await (const book of paginated(getBooks)) {
        booksCount++;
        expect(book.baseAsset).toSatisfy(isKnownAsset);
        expect(book.quoteAsset).toSatisfy(isKnownAsset);
      }

      expect(booksCount).toBeGreaterThan(0);
    });

    it('same books should be accessible both in the list of books and separately', async () => {
      for await (const listedBook of paginated(getBooks)) {
        const id = encodeURIComponent(listedBook.id);
        const book = await client.trading.getBookDetails({ id });
        expect(book).toEqual(listedBook);
      }
    });
  });

  describe('getBookAsks, getBookBids', () => {
    const booksCountToTest = 3;
    let books: OrderBook[];

    const getAsks = async (bookId: string) => {
      const response = await client.trading.getBookAsks({
        id: encodeURIComponent(bookId),
        limit: 100,
      });
      return response.asks;
    };

    const getBids = async (bookId: string) => {
      const response = await client.trading.getBookBids({
        id: encodeURIComponent(bookId),
        limit: 100,
      });
      return response.bids;
    };

    beforeAll(async () => {
      books = await getBooks(booksCountToTest);
    });

    describe.each([
      { name: 'asks', fn: getAsks },
      { name: 'bids', fn: getBids },
    ])(`$name`, ({ name, fn }) => {
      it('should return at least an empty array', async () => {
        for (const book of books.slice(0, booksCountToTest)) {
          const entries = await fn(book.id);
          expect(entries, `In book ${book.id}`).toBeArray();
        }
      });

      it(`${name} assets should be equal to the book quote asset`, async () => {
        for (const book of books.slice(0, booksCountToTest)) {
          const entries = await fn(book.id);
          for (const entry of entries) {
            expect(entry, `In book ${book.id}`).toContainEntry(['asset', book.quoteAsset]);
          }
        }
      });
    });
  });
});
