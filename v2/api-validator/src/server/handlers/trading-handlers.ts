import * as ErrorFactory from '../http-error-factory';
import { FastifyReply, FastifyRequest } from 'fastify';
import { asks, bids, books } from '../controllers/books-controller';
import { MarketEntry, MarketTrade, Order, OrderBook } from '../../client/generated';
import { getPaginationResult } from '../controllers/pagination-controller';
import { EntityIdPathParam, PaginationQuerystring } from './request-types';

type GetBooksResponse = { books: OrderBook[] };
type GetBookAsksResponse = { asks: MarketEntry[] };
type GetBookBidsResponse = { bids: MarketEntry[] };

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
