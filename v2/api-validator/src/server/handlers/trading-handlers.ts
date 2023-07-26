import { FastifyReply, FastifyRequest } from 'fastify';
import { ErrorType, MarketEntry, MarketTrade, Order, OrderBook } from '../../client/generated';
import { books } from '../controllers/books-controller';
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
  return reply.code(404).send({
    message: 'Entity not found',
    errorType: ErrorType.NOT_FOUND,
  });
}

export async function getBookAsks(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<MarketEntry[]> {
  return reply.code(404).send({
    message: 'Entity not found',
    errorType: ErrorType.NOT_FOUND,
  });
}

export async function getBookBids(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<MarketEntry[]> {
  return reply.code(404).send({
    message: 'Entity not found',
    errorType: ErrorType.NOT_FOUND,
  });
}

export async function getBookOrderHistory(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<MarketTrade[]> {
  return reply.code(404).send({
    message: 'Entity not found',
    errorType: ErrorType.NOT_FOUND,
  });
}

export async function getOrders(request: FastifyRequest, reply: FastifyReply): Promise<Order[]> {
  return reply.code(404).send({
    message: 'Entity not found',
    errorType: ErrorType.NOT_FOUND,
  });
}

export async function createOrder(request: FastifyRequest, reply: FastifyReply): Promise<Order> {
  return reply.code(404).send({
    message: 'Entity not found',
    errorType: ErrorType.NOT_FOUND,
  });
}

export async function getOrderDetails(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<Order> {
  return reply.code(404).send({
    message: 'Entity not found',
    errorType: ErrorType.NOT_FOUND,
  });
}

export async function cancelOrder(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  return reply.code(404).send({
    message: 'Entity not found',
    errorType: ErrorType.NOT_FOUND,
  });
}
