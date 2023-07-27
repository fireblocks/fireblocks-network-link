import * as ErrorFactory from '../http-error-factory';
import { FastifyReply, FastifyRequest } from 'fastify';
import { books } from '../controllers/books-controller';
import { MarketEntry, MarketTrade, Order, OrderBook } from '../../client/generated';
import { getPaginationResult } from '../controllers/pagination-controller';
import { EntityIdPathParam, PaginationQuerystring } from './request-types';

type GetBooksResponse = { books: OrderBook[] };

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
