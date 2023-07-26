import config from '../../src/config';
import ApiClient from '../../src/client';
import { OrderBook } from '../../src/client/generated';
import { Pageable, paginated } from '../utils/pagination';
import { AssetsDirectory } from '../utils/assets-directory';

const tradingCapability = config.get('capabilities').components.trading;

describe.skipIf(!tradingCapability)('Trading API tests', () => {
  const client = new ApiClient();
  let assets: AssetsDirectory;

  beforeAll(async () => {
    assets = await AssetsDirectory.fetch();
  });

  describe('getBooks', () => {
    const getBooks: Pageable<OrderBook> = async (limit, startingAfter?) => {
      const response = await client.capabilities.getBooks({ limit, startingAfter });
      return response.books;
    };

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
  });
});
