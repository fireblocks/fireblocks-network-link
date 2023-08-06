import * as ErrorFactory from '../http-error-factory';
import { FastifyReply, FastifyRequest } from 'fastify';
import { OrdersController } from '../controllers/orders-controller';
import { asks, bids, books } from '../controllers/books-controller';
import { isKnownSubAccount } from '../controllers/accounts-controller';
import { IdempotencyHandler } from '../controllers/idempotency-handler';
import { getPaginationResult } from '../controllers/pagination-controller';
import { AccountIdPathParam, EntityIdPathParam, PaginationQuerystring } from './request-types';
import {
  MarketEntry,
  MarketTrade,
  Order,
  OrderBook,
  OrderRequest,
  OrderStatus,
} from '../../client/generated';

type GetBooksResponse = { books: OrderBook[] };
type GetBookAsksResponse = { asks: MarketEntry[] };
type GetBookBidsResponse = { bids: MarketEntry[] };

type CreateOrderRequest = { Body: OrderRequest };

const ordersController = new OrdersController();
const idempotencyHandler = new IdempotencyHandler<OrderRequest, Order>();

export async function getBooks({
  query,
}: FastifyRequest<PaginationQuerystring>): Promise<GetBooksResponse> {
  const { limit, startingAfter, endingBefore } = query;
  return {
    books: getPaginationResult(limit, startingAfter, endingBefore, books, 'id'),
  };
}

export async function getBookDetails(
  { params }: FastifyRequest<EntityIdPathParam>,
  reply: FastifyReply
): Promise<OrderBook> {
  const id = decodeURIComponent(params.id);
  const book = books.find((b) => b.id === id);
  if (!book) {
    return ErrorFactory.notFound(reply);
  }

  return book;
}

export async function getBookAsks(
  { params, query }: FastifyRequest<EntityIdPathParam & PaginationQuerystring>,
  reply: FastifyReply
): Promise<GetBookAsksResponse> {
  const id = decodeURIComponent(params.id);
  const book = books.find((b) => b.id === id);
  if (!book) {
    return ErrorFactory.notFound(reply);
  }

  const bookAsks = asks[id];
  if (!bookAsks) {
    return { asks: [] };
  }

  const { limit, startingAfter, endingBefore } = query;
  return {
    asks: getPaginationResult(limit, startingAfter, endingBefore, bookAsks, 'id'),
  };
}

export async function getBookBids(
  { params, query }: FastifyRequest<EntityIdPathParam & PaginationQuerystring>,
  reply: FastifyReply
): Promise<GetBookBidsResponse> {
  const id = decodeURIComponent(params.id);
  const book = books.find((b) => b.id === id);
  if (!book) {
    return ErrorFactory.notFound(reply);
  }

  const bookBids = bids[id];
  if (!bookBids) {
    return { bids: [] };
  }

  const { limit, startingAfter, endingBefore } = query;
  return {
    bids: getPaginationResult(limit, startingAfter, endingBefore, bookBids, 'id'),
  };
}

export async function getBookOrderHistory(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<MarketTrade[]> {
  return ErrorFactory.notFound(reply);
}

export async function getOrders(request: FastifyRequest, reply: FastifyReply): Promise<Order[]> {
  return ErrorFactory.notFound(reply);
}

export async function createOrder(
  { params, body }: FastifyRequest<AccountIdPathParam & CreateOrderRequest>,
  reply: FastifyReply
): Promise<Order> {
  const { accountId } = params;

  if (!isKnownSubAccount(accountId)) {
    return ErrorFactory.notFound(reply);
  }

  if (idempotencyHandler.isKnownKey(body.idempotencyKey)) {
    return idempotencyHandler.reply(body, reply);
  }

  const response = ordersController.createOrder(body);
  idempotencyHandler.add(body, response);

  return response;
}

export async function getOrderDetails(
  { params }: FastifyRequest<AccountIdPathParam & EntityIdPathParam>,
  reply: FastifyReply
): Promise<Order> {
  if (!isKnownSubAccount(params.accountId)) {
    return ErrorFactory.notFound(reply);
  }

  const order = ordersController.findOrder(params.id);
  if (!order) {
    return ErrorFactory.notFound(reply);
  }
  return order;
}

export async function cancelOrder(
  { params }: FastifyRequest<AccountIdPathParam & EntityIdPathParam>,
  reply: FastifyReply
): Promise<void> {
  if (!isKnownSubAccount(params.accountId)) {
    return ErrorFactory.notFound(reply);
  }

  const order = ordersController.findOrder(params.id);
  if (!order) {
    return ErrorFactory.notFound(reply);
  }

  if (order.status !== OrderStatus.TRADING) {
    return ErrorFactory.orderNotTrading(reply);
  }

  ordersController.cancelOrder(params.id);
}
