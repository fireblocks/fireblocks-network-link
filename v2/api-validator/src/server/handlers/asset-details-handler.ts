import { FastifyReply, FastifyRequest } from 'fastify';
import { AssetDefinition, EntityIdPathParam, ErrorType } from '../../client/generated';
import { SUPPORTED_ASSETS } from './additional-assets-handler';

const ASSET_NOT_FOUND_ERROR = {
  message: 'Asset not found',
  errorType: ErrorType.NOT_FOUND,
};

export async function getAssetDetails(
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
