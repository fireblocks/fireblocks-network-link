import _ from 'lodash';
import { randomUUID } from 'crypto';
import BigNumber from 'bignumber.js';
import ApiClient from '../../src/client';
import { AssetsDirectory } from '../utils/assets-directory';
import { getCapableAccountId, hasCapability } from '../utils/capable-accounts';
import { arrayFromAsyncGenerator, Pageable, paginated } from '../utils/pagination';
import {
  ApiError,
  AssetBalance,
  BadRequestError,
  LimitOrderData,
  MarketOrderData,
  Order,
  OrderBook,
  OrderData,
  OrderRequest,
  OrderSide,
  OrderStatus,
  OrderTimeInForce,
  PositiveAmount,
} from '../../src/client/generated';

const LIMIT = LimitOrderData.orderType.LIMIT;
const MARKET = MarketOrderData.orderType.MARKET;

type OrderType = LimitOrderData.orderType.LIMIT | MarketOrderData.orderType.MARKET;

const noTradingCapability = !hasCapability('trading');

describe.skipIf(noTradingCapability)('Trading API tests', () => {
  const client = new ApiClient();
  let assets: AssetsDirectory;
  let accountId: string;

  const getBooks: Pageable<OrderBook> = async (limit, startingAfter?) => {
    const response = await client.capabilities.getBooks({ limit, startingAfter });
    return response.books;
  };

  beforeAll(async () => {
    assets = await AssetsDirectory.fetch();
    accountId = getCapableAccountId('trading');
  });

  describe('getBooks getBookDetails', () => {
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

  describe('getBookAsks getBookBids', () => {
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
      { name: 'asks', fn: getAsks, expectedSide: OrderSide.SELL },
      { name: 'bids', fn: getBids, expectedSide: OrderSide.BUY },
    ])(`$name`, ({ name, fn, expectedSide }) => {
      it('should return at least an empty array', async () => {
        for (const book of books.slice(0, booksCountToTest)) {
          const entries = await fn(book.id);
          expect(entries, `In book ${book.id}`).toBeArray();
        }
      });

      it(`${name} side should be ${expectedSide}`, async () => {
        for (const book of books.slice(0, booksCountToTest)) {
          const entries = await fn(book.id);
          for (const entry of entries) {
            expect(entry, `In book ${book.id}`).toContainEntry(['side', expectedSide]);
          }
        }
      });
    });
  });

  describe('Orders', () => {
    const client = new ApiClient();
    let balances: AssetBalance[];
    let books: OrderBook[];

    const getBalances: Pageable<AssetBalance> = async (limit, startingAfter?) => {
      const response = await client.balances.getBalances({ accountId, limit, startingAfter });
      return response.balances;
    };

    const getBooks: Pageable<OrderBook> = async (limit, startingAfter?) => {
      const response = await client.capabilities.getBooks({ limit, startingAfter });
      return response.books;
    };

    beforeAll(async () => {
      balances = await arrayFromAsyncGenerator(paginated(getBalances));
      books = await arrayFromAsyncGenerator(paginated(getBooks));
    });

    describe('Create several orders and list them', () => {
      const ordersData: OrderData[] = [];

      beforeAll(async () => {
        const ordersCount = 10;
        for (let i = 0; i < ordersCount; i++) {
          const orderCandidate = await generateValidOrder(LIMIT, books, balances);
          if (!orderCandidate) {
            throw new Error(
              `Failed to generate a valid order for account ${accountId}. Is there enough balance?`
            );
          }
          ordersData.push(orderCandidate);
        }
      });

      it('should list the created orders sorted from the latest to the earliest', async () => {
        const orderIds: string[] = [];

        for (const orderData of ordersData) {
          const requestBody: OrderRequest = { ...orderData, idempotencyKey: randomUUID() };
          const order = await client.trading.createOrder({ accountId, requestBody });
          orderIds.push(order.id);
        }

        const getOrders: Pageable<Order> = async (limit, startingAfter?) => {
          const response = await client.trading.getOrders({ accountId, limit, startingAfter });
          return response.orders;
        };

        let expectedOrderId = orderIds.pop();
        for await (const order of paginated(getOrders)) {
          // Fulfilled orders should contain their trades
          if (order.status === OrderStatus.FULFILLED) {
            const orderWithTrades = await client.trading.getOrderDetails({
              accountId,
              id: order.id,
            });
            expect(orderWithTrades.trades.length).toBeGreaterThan(0);
          }

          if (order.id === expectedOrderId) {
            expectedOrderId = orderIds.pop();
            if (!expectedOrderId) {
              break;
            }
          }
        }

        const errorTxt = 'Orders not correctly sorted or not all orders listed';
        expect(orderIds, errorTxt).toBeEmpty();
      });
    });

    describe.each([[LIMIT], [MARKET]])('Create %s order', (orderType) => {
      let orderData: OrderData;

      beforeAll(async () => {
        const orderCandidate = await generateValidOrder(orderType, books, balances);
        if (!orderCandidate) {
          throw new Error(
            `Failed to generate a valid order for account ${accountId}. Is there enough balance?`
          );
        }
        orderData = orderCandidate;
      });

      it('should be able to create an order and retrieve its details', async () => {
        const requestBody: OrderRequest = { ...orderData, idempotencyKey: randomUUID() };
        const order1 = await client.trading.createOrder({ accountId, requestBody });
        expect(order1).toMatchObject(orderData);

        const order2 = await client.trading.getOrderDetails({ accountId, id: order1.id });
        expect(order2).toMatchObject(orderData);
      });

      it('should create an order with any status other than canceled', async () => {
        const requestBody: OrderRequest = { ...orderData, idempotencyKey: randomUUID() };
        const order1 = await client.trading.createOrder({ accountId, requestBody });
        expect(order1).toMatchObject(orderData);
        expect(order1.status).not.toEqual(OrderStatus.CANCELED);
      });

      it('should return the same order if creating twice with the same idempotency key', async () => {
        const requestBody: OrderRequest = { ...orderData, idempotencyKey: randomUUID() };
        const order1 = await client.trading.createOrder({ accountId, requestBody });
        expect(order1).toMatchObject(orderData);

        const order2 = await client.trading.createOrder({ accountId, requestBody });
        expect(order2).toMatchObject(orderData);

        expect(order1.id).toEqual(order2.id);
      });

      it('should fail when reusing idempotency key for different request', async () => {
        const requestBody1: OrderRequest = { ...orderData, idempotencyKey: randomUUID() };
        const order1 = await client.trading.createOrder({ accountId, requestBody: requestBody1 });
        expect(order1).toMatchObject(orderData);

        const findOtherTimeInForce = (timeInForce: OrderTimeInForce): OrderTimeInForce => {
          for (const x of Object.keys(OrderTimeInForce)) {
            if (timeInForce !== OrderTimeInForce[x]) return OrderTimeInForce[x];
          }
          throw new Error('Inconceivable!');
        };

        const requestBody2 = {
          ...requestBody1,
          timeInForce: findOtherTimeInForce(requestBody1.timeInForce),
        };

        let error: ApiError | undefined;
        try {
          await client.trading.createOrder({ accountId, requestBody: requestBody2 });
        } catch (e) {
          if (e instanceof ApiError) {
            error = e;
          }
        }
        expect(error?.status).toEqual(400);
        expect(error?.body?.errorType).toEqual(BadRequestError.errorType.IDEMPOTENCY_KEY_REUSE);
      });

      // Market orders cannot be cancelled on Luno
      it.skipIf(orderType === "MARKET") ('should be able to cancel a trading order only once', async () => {
        const requestBody: OrderRequest = { ...orderData, idempotencyKey: randomUUID() };
        const order1 = await client.trading.createOrder({ accountId, requestBody });

        if (order1.status === OrderStatus.TRADING) {
          await client.trading.cancelOrder({ accountId, id: order1.id });
          const order2 = await client.trading.getOrderDetails({ accountId, id: order1.id });

          expect(order1.id).toEqual(order2.id);
          expect(order2.status).toEqual(OrderStatus.CANCELED);

          let error: ApiError | undefined;
          try {
            await client.trading.cancelOrder({ accountId, id: order1.id });
          } catch (e) {
            if (e instanceof ApiError) {
              error = e;
            }
          }
          expect(error?.status).toEqual(400);
          expect(error?.body?.errorType).toEqual(BadRequestError.errorType.ORDER_NOT_TRADING);
        }
      });
    });
  });
});

async function generateValidOrder(
  orderType: OrderType,
  books: OrderBook[],
  balances: AssetBalance[]
) {
  if (orderType === LIMIT) {
    return await generateValidLimitOrder(books, balances);
  }
  if (orderType === MARKET) {
    return await generateValidMarketOrder(books, balances);
  }
}

async function generateValidLimitOrder(books: OrderBook[], balances: AssetBalance[]) {
  const defaultAskPrice = new BigNumber(1000);
  const priceMultiplier = 10;

  const client = new ApiClient();

  for (const book of books) {
    const bidsResponse = await client.trading.getBookBids({
      id: encodeURIComponent(book.id),
      limit: 1,
    });
    const highestBid = bidsResponse.bids[0];

    const askPrice = !highestBid
      ? defaultAskPrice
      : new BigNumber(highestBid.price).multipliedBy(priceMultiplier);

    const order = generateValidOrderForBook(book, balances, LIMIT, askPrice.toFixed());
    if (order) {
      return order;
    }
  }
}

async function generateValidMarketOrder(books: OrderBook[], balances: AssetBalance[]) {
  const defaultPrice = '1';

  for (const book of books) {
    const order = generateValidOrderForBook(book, balances, MARKET, defaultPrice);
    if (order) {
      return order;
    }
  }
}

function generateValidOrderForBook(
  book: OrderBook,
  balances: AssetBalance[],
  orderType: OrderType,
  quoteAssetPrice: PositiveAmount
): OrderData | undefined {
  const defaultQuantityToTrade = '1';

  const base = balances.find((b) => _.isEqual(b.asset, book.baseAsset));
  const quote = balances.find((b) => _.isEqual(b.asset, book.quoteAsset));
  if (!base || !quote) {
    return undefined;
  }

  const order = {
    bookId: book.id,
    orderType,
    timeInForce: OrderTimeInForce.GOOD_TILL_CANCELED,
  };
  if (orderType === LIMIT) {
    order['quoteAssetPrice'] = quoteAssetPrice;
  }

  const baseAssetQuantity = new BigNumber(base.availableAmount);
  if (baseAssetQuantity.isGreaterThanOrEqualTo(defaultQuantityToTrade)) {
    order['side'] = OrderSide.SELL;
    order['baseAssetQuantity'] = defaultQuantityToTrade;
    return order as OrderData;
  }

  const quoteAssetQuantity = new BigNumber(quote.availableAmount);
  const minimumQuoteAssetQuantityToTrade = new BigNumber(defaultQuantityToTrade).multipliedBy(
    new BigNumber(quoteAssetPrice)
  );
  if (quoteAssetQuantity.isGreaterThanOrEqualTo(minimumQuoteAssetQuantityToTrade)) {
    order['side'] = OrderSide.BUY;
    order['baseAssetQuantity'] = defaultQuantityToTrade;
    return order as OrderData;
  }
}
