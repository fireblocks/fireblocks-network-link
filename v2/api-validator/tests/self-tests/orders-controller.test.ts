import { randomUUID } from 'crypto';
import { books } from '../../src/server/controllers/books-controller';
import {
  CannotCancelOrder,
  OrdersController,
  UnknownBookError,
  UnknownOrderError,
} from '../../src/server/controllers/orders-controller';
import {
  LimitOrderData,
  Order,
  OrderData,
  OrderSide,
  OrderStatus,
  OrderTimeInForce,
} from '../../src/client/generated';

const book = books[0];

const orderDetails: OrderData = {
  bookId: book.id,
  side: OrderSide.BUY,
  orderType: LimitOrderData.orderType.LIMIT,
  timeInForce: OrderTimeInForce.GOOD_TILL_CANCELED,
  quoteAssetPrice: '1.2',
  baseAssetQuantity: '10',
};

describe('Create order', () => {
  let controller: OrdersController;

  beforeEach(() => {
    controller = new OrdersController();
  });

  describe('Order for an existing book', () => {
    let order: Order;

    beforeEach(() => {
      order = controller.createOrder({ ...orderDetails, idempotencyKey: randomUUID() });
    });

    it('should copy the data from the request object', () => {
      expect(order).toMatchObject(orderDetails);
    });
    it('should have id', () => {
      expect(order.id).not.toBeEmpty();
    });
    it('should have status "trading"', () => {
      expect(order.status).toEqual(OrderStatus.TRADING);
    });
    it('should have creation date', () => {
      expect(order.createdAt).toBeDateString();
    });
  });

  describe('Order for a non existing book', () => {
    it('should throw UnknownBookError', () => {
      const badOrderDetails: OrderData = { ...orderDetails, bookId: 'USD_XLM' };

      expect(() =>
        controller.createOrder({ ...badOrderDetails, idempotencyKey: randomUUID() })
      ).toThrow(UnknownBookError);
    });
  });
});

describe('Cancel order', () => {
  let controller: OrdersController;
  let orderId: string;

  beforeEach(() => {
    controller = new OrdersController();
    const order = controller.createOrder({ ...orderDetails, idempotencyKey: randomUUID() });
    orderId = order.id;
  });

  describe('Order is trading', () => {
    it('should cancel', () => {
      controller.cancelOrder(orderId);
      const order = controller.findOrder(orderId);
      expect(order).toBeDefined();
      expect(order?.status).toEqual(OrderStatus.CANCELED);
    });
  });

  describe('Unknown order', () => {
    it('should throw UnknownOrderError', () => {
      expect(() => controller.cancelOrder(randomUUID())).toThrow(UnknownOrderError);
    });
  });

  describe('Cancel order twice', () => {
    it('should throw CannotCancelOrder', () => {
      controller.cancelOrder(orderId);
      expect(() => controller.cancelOrder(orderId)).toThrow(CannotCancelOrder);
    });
  });
});
