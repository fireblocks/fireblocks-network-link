import _ from 'lodash';
import logger from '../../logging';
import { randomUUID } from 'crypto';
import { XComError } from '../../error';
import {
  Order,
  OrderData,
  OrderRequest,
  OrderStatus,
  OrderWithTrades,
} from '../../client/generated';
import { getPaginationResult } from './pagination-controller';
import { BooksController } from './books-controller';

const log = logger('server');

export class OrdersController {
  private readonly orders: Array<OrderWithTrades> = [];

  public createOrder(order: OrderRequest): Order {
    const book = BooksController.getBook(order.bookId);
    if (!book) {
      throw new UnknownBookError(order.bookId);
    }

    const orderData = _.omit(order, 'idempotencyKey') as OrderData;

    const newOrder: OrderWithTrades = {
      ...orderData,
      id: randomUUID(),
      status: OrderStatus.TRADING,
      trades: [],
      createdAt: new Date().toISOString(),
    };
    this.orders.push(newOrder);

    log.info('New order', { order: newOrder });
    return newOrder;
  }

  public getOrders(limit: number, startingAfter?: string, endingBefore?: string): Order[] {
    return getPaginationResult(
      limit,
      startingAfter,
      endingBefore,
      _.orderBy(this.orders, 'createdAt', 'desc'),
      'id'
    );
  }

  public getOrdersCount(): number {
    return this.orders.length;
  }

  public findOrder(orderId: string): OrderWithTrades | undefined {
    return this.orders.find((o) => o.id === orderId);
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
