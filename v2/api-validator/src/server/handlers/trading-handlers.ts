import * as ErrorFactory from '../http-error-factory';
import { FastifyReply, FastifyRequest } from 'fastify';
import { books } from '../controllers/books-controller';
import { MarketEntry, MarketTrade, Order, OrderBook } from '../../client/generated';
import { getPaginationResult, PaginationParams } from '../controllers/pagination-controller';

type GetBooksResponse = { books: OrderBook[] };

export async function getBooks(request: FastifyRequest): Promise<GetBooksResponse> {
  const { limit, startingAfter, endingBefore } = request.query as PaginationParams;

  return {
    books: getPaginationResult(limit, startingAfter, endingBefore, books, 'id'),
  };
}

export async function getBookDetails(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<OrderBook> {
  return ErrorFactory.notFound(reply);
}

export async function getBookAsks(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<MarketEntry[]> {
  return ErrorFactory.notFound(reply);
}

export async function getBookBids(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<MarketEntry[]> {
  return ErrorFactory.notFound(reply);
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

export async function createOrder(request: FastifyRequest, reply: FastifyReply): Promise<Order> {
  return ErrorFactory.notFound(reply);
}

export async function getOrderDetails(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<Order> {
  return ErrorFactory.notFound(reply);
}

export async function cancelOrder(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  return ErrorFactory.notFound(reply);
}
