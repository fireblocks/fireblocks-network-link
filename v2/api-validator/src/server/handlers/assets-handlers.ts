import * as ErrorFactory from '../http-error-factory';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AssetDefinition } from '../../client/generated';
import { AssetsController } from '../controllers/assets-controller';
import { getPaginationResult } from '../controllers/pagination-controller';
import { EntityIdPathParam, PaginationQuerystring } from './request-types';

type AdditionalAssetResponse = { assets: AssetDefinition[] };

export async function getAdditionalAssets(
  request: FastifyRequest<PaginationQuerystring>
): Promise<AdditionalAssetResponse> {
  const { limit, startingAfter, endingBefore } = request.query;

  return {
    assets: getPaginationResult(
      limit,
      startingAfter,
      endingBefore,
      AssetsController.getAllAdditionalAssets(),
      'id'
    ),
  };
}

export async function getAssetDetails(
  request: FastifyRequest<EntityIdPathParam>,
  reply: FastifyReply
): Promise<AssetDefinition> {
  const { id } = request.params;
  const asset = AssetsController.getAdditionalAsset(id);

  if (!asset) {
    return ErrorFactory.notFound(reply);
  }

  return asset;
}
