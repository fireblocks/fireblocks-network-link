import { FastifyReply, FastifyRequest } from 'fastify';
import { AssetDefinition } from '../../client/generated';
import {
  ENDING_STARTING_COMBINATION_ERROR,
  getPaginationResult,
  InvalidPaginationParamsCombinationError,
  PaginationParams,
} from '../controllers/pagination-controller';
import { assetsController } from '../controllers/assets-controller';

export async function getAdditionalAssets(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<{ assets: AssetDefinition[] }> {
  const paginationParams = request.query as PaginationParams;

  try {
    const result = getPaginationResult(
      paginationParams.limit,
      paginationParams.startingAfter,
      paginationParams.endingBefore,
      assetsController.getAllAdditionalAssets(),
      'id'
    );
    return { assets: result };
  } catch (err) {
    if (err instanceof InvalidPaginationParamsCombinationError) {
      return reply.code(400).send(ENDING_STARTING_COMBINATION_ERROR);
    }
    throw err;
  }
}
