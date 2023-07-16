import Client from '../src/client';
import { OrderSide, OrderTimeInForce, OrderType } from '../src/client/generated';

describe('Capabilities', () => {
  describe('Most naive one', () => {
    let result;

    beforeAll(async () => {
      const client = new Client();
      try {
        await client.capabilities.getCapabilities({});
        // await client.capabilities.getQuoteCapabilities({});
        await client.trading.createOrder({
          accountId: '0',
          requestBody: {
            idempotencyKey: '03449d61-0966-481e-b12c-df651451c258',
            bookId: 'BTC_ETH',
            side: OrderSide.BUY,
            orderType: OrderType.LIMIT,
            timeInForce: OrderTimeInForce.FILL_OR_KILL,
            baseAssetQuantity: 10,
            baseAssetPrice: 'fsdfsdsdf',
          },
        });
      } catch (e) {
        console.log(e);
      }
    });

    it('should work', () => {
      expect(result).toEqual('Vigilo Confido');
    });
  });
});
