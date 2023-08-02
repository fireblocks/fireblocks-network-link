import { randomUUID } from 'crypto';
import { XComError } from '../../error';
import { books } from './books-controller';
import { Order, OrderData, OrderRequest, OrderStatus } from '../../client/generated';
import _ from 'lodash';
import logger from '../../logging';

const log = logger('server');

type StoredOrder = { order: Order; idempotencyKey: string };

export class OrdersController {
  private readonly usedIdempotencyKeys = new Set<string>();
  private readonly orders: Array<StoredOrder> = [];

  public createOrder(order: OrderRequest): Order {
    const book = books.find((b) => b.id === order.bookId);
    if (!book) {
      throw new UnknownBookError(order.bookId);
    }

    const orderData = _.omit(order, 'idempotencyKey') as OrderData;

    const idempotentOrder = this.orders.find((o) => o.idempotencyKey === order.idempotencyKey);
    if (idempotentOrder) {
      if (_.isMatch(idempotentOrder.order, orderData)) {
        return idempotentOrder.order;
      } else {
        throw new IdempotencyKeyReuseError(order.idempotencyKey);
      }
    }

    const newOrder: Order = {
      ...orderData,
      id: randomUUID(),
      status: OrderStatus.TRADING,
      trades: [],
      createdAt: new Date().toISOString(),
    };
    this.orders.push({ order: newOrder, idempotencyKey: order.idempotencyKey });

    log.info('New order', { order: newOrder });
    return newOrder;
  }

  public getOrdersCount(): number {
    return this.orders.length;
  }

  public findOrder(orderId: string): Order | undefined {
    log.warn('All orders', { orders: this.orders });
    const stored = this.orders.find((o) => o.order.id === orderId);
    return stored?.order;
  }

  public cancelOrder(orderId: string): void {
    const order = this.findOrder(orderId);
    if (!order) {
      throw new UnknownOrderError(orderId);
    }

    if (order.status !== OrderStatus.TRADING) {
      throw new CannotCancelOrder(orderId, order.status);
    }

    order.status = OrderStatus.CANCELED;
  }
}

export class UnknownBookError extends XComError {
  constructor(public readonly book: string) {
    super('Unknown book', { book });
  }
}

export class UnknownOrderError extends XComError {
  constructor(public readonly id: string) {
    super('Unknown order', { id });
  }
}

export class CannotCancelOrder extends XComError {
  constructor(public readonly id: string, public readonly status: OrderStatus) {
    super('Cannot cancel order in this state', { id, status });
  }
}

export class IdempotencyKeyReuseError extends XComError {
  constructor(public readonly key: string) {
    super('Idempotency key was already used', { key });
  }
}
