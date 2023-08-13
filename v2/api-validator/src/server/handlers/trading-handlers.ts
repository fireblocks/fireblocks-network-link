import * as ErrorFactory from '../http-error-factory';
import { FastifyReply, FastifyRequest } from 'fastify';
import { BooksController } from '../controllers/books-controller';
import { OrdersController } from '../controllers/orders-controller';
import { IdempotencyHandler } from '../controllers/idempotency-handler';
import { getPaginationResult } from '../controllers/pagination-controller';
import { ControllersContainer } from '../controllers/controllers-container';
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
type GetOrdersResponse = { orders: Order[] };

const idempotencyHandler = new IdempotencyHandler<OrderRequest, Order>();
const controllers = new ControllersContainer(() => new OrdersController());

export async function getBooks({
  query,
}: FastifyRequest<PaginationQuerystring>): Promise<GetBooksResponse> {
  const { limit, startingAfter, endingBefore } = query;
  return {
    books: getPaginationResult(
      limit,
      startingAfter,
      endingBefore,
      BooksController.getAllBooks(),
      'id'
    ),
  };
}

export async function getBookDetails(
  { params }: FastifyRequest<EntityIdPathParam>,
  reply: FastifyReply
): Promise<OrderBook> {
  const id = decodeURIComponent(params.id);
  const book = BooksController.getBook(id);
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
  const book = BooksController.getBook(id);
  if (!book) {
    return ErrorFactory.notFound(reply);
  }

  const bookAsks = BooksController.getAsks(id);
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
  const book = BooksController.getBook(id);
  if (!book) {
    return ErrorFactory.notFound(reply);
  }

  const bookBids = BooksController.getBids(id);
  if (!bookBids) {
    return { bids: [] };
  }

  const { limit, startingAfter, endingBefore } = query;
  return {
    bids: getPaginationResult(limit, startingAfter, endingBefore, bookBids, 'id'),
  };
}

export async function getBookOrderHistory(
  { params }: FastifyRequest<EntityIdPathParam & PaginationQuerystring>,
  reply: FastifyReply
): Promise<MarketTrade[]> {
  const id = decodeURIComponent(params.id);
  const book = BooksController.getBook(id);
  if (!book) {
    return ErrorFactory.notFound(reply);
  }

  return [];
}

export async function getOrders(
  { params, query }: FastifyRequest<AccountIdPathParam & PaginationQuerystring>,
  reply: FastifyReply
): Promise<GetOrdersResponse> {
  const { accountId } = params;

  const controller = controllers.getController(accountId);
  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  const { limit, startingAfter, endingBefore } = query;
  return {
    orders: controller.getOrders(limit, startingAfter, endingBefore),
  };
}

export async function createOrder(
  { params, body }: FastifyRequest<AccountIdPathParam & CreateOrderRequest>,
  reply: FastifyReply
): Promise<Order> {
  const { accountId } = params;

  const controller = controllers.getController(accountId);
  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  if (idempotencyHandler.isKnownKey(body.idempotencyKey)) {
    return idempotencyHandler.reply(body, reply);
  }

  const response = controller.createOrder(body);
  idempotencyHandler.add(body, 200, response);

  return response;
}

export async function getOrderDetails(
  { params }: FastifyRequest<AccountIdPathParam & EntityIdPathParam>,
  reply: FastifyReply
): Promise<Order> {
  const controller = controllers.getController(params.accountId);
  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  const order = controller.findOrder(params.id);
  if (!order) {
    return ErrorFactory.notFound(reply);
  }
  return order;
}

export async function cancelOrder(
  { params }: FastifyRequest<AccountIdPathParam & EntityIdPathParam>,
  reply: FastifyReply
): Promise<void> {
  const controller = controllers.getController(params.accountId);
  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  const order = controller.findOrder(params.id);
  if (!order) {
    return ErrorFactory.notFound(reply);
  }

  if (order.status !== OrderStatus.TRADING) {
    return ErrorFactory.orderNotTrading(reply);
  }

  controller.cancelOrder(params.id);
}
