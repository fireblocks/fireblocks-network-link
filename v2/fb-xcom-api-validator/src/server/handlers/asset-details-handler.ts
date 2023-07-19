import logger from '../../logging';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AssetDefinition, EntityIdPathParam, NotFoundError } from '../../client/generated';
import { SUPPORTED_ASSETS } from './additional-assets-handler';

const log = logger('handler:asset-details');

const ASSET_NOT_FOUND_ERROR: NotFoundError = {
  message: 'Asset not found',
  errorType: NotFoundError.errorType.NOT_FOUND,
};

export async function handleGetAssetDetails(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<AssetDefinition | void> {
  const params = request.params as { id: EntityIdPathParam };
  const asset = SUPPORTED_ASSETS.find((asset) => asset.id === params.id);

  if (!asset) {
    reply.code(404).send(ASSET_NOT_FOUND_ERROR);
    return;
  }

  return asset;
}
