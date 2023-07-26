import config from '../../src/config';
import ApiClient from '../../src/client';
import {
  AssetDefinition,
  AssetReference,
  Layer1Cryptocurrency,
  Layer2Cryptocurrency,
  NationalCurrencyCode,
  OrderBook,
} from '../../src/client/generated';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Describe {
      skipIf: (skip: boolean) => Describe;
    }
  }
}

describe.skipIf = (skip: boolean) => (skip ? describe.skip : describe);

const tradingCapability = config.get('capabilities').components.trading;
const LIMIT = 1;

type Pageable<T> = (limit: number, startingAfter?: string) => Promise<T[]>;

async function* paginated<T>(f: Pageable<T>, idPropName = 'id') {
  let page = await f(LIMIT);
  while (page.length > 0) {
    for (const item of page) {
      yield item;
    }
    const startingAfter = page.at(-1)?.[idPropName];
    page = await f(LIMIT, startingAfter);
  }
}

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

class AssetsDirectory {
  public static async fetch(): Promise<AssetsDirectory> {
    const client = new ApiClient();
    const assets: AssetDefinition[] = [];

    const getAdditionalAssets: Pageable<AssetDefinition> = async (limit, startingAfter?) => {
      const response = await client.capabilities.getAdditionalAssets({ limit, startingAfter });
      return response.assets;
    };

    for await (const asset of paginated(getAdditionalAssets)) {
      assets.push(asset);
    }

    return new AssetsDirectory(assets);
  }
  constructor(private readonly assets: AssetDefinition[]) {}

  public isKnownAdditionalAsset(assetId: string): boolean {
    return this.assets.some((x) => x.id === assetId);
  }

  public isKnownAsset(asset: AssetReference): boolean {
    if ('assetId' in asset) {
      return this.isKnownAdditionalAsset(asset.assetId);
    }
    if ('cryptocurrencySymbol' in asset) {
      return (
        !!Layer1Cryptocurrency[asset.cryptocurrencySymbol] ||
        !!Layer2Cryptocurrency[asset.cryptocurrencySymbol]
      );
    }
    if ('nationalCurrencyCode' in asset) {
      return !!NationalCurrencyCode[asset.nationalCurrencyCode];
    }
    return false;
  }
}
