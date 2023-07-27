import { FastifyReply, FastifyRequest } from 'fastify';
import { AssetDefinition, EntityIdPathParam, ErrorType } from '../../client/generated';
import { getSupportedAsset } from '../controllers/assets-controller';

const ASSET_NOT_FOUND_ERROR = {
  message: 'Asset not found',
  errorType: ErrorType.NOT_FOUND,
};

export async function getAssetDetails(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<AssetDefinition | void> {
  const { id } = request.params as { id: EntityIdPathParam };
  const asset = getSupportedAsset(id);

  if (!asset) {
    reply.code(404).send(ASSET_NOT_FOUND_ERROR);
    return;
  }

  return asset;
}
