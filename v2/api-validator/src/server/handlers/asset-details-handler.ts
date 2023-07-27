import * as ErrorFactory from '../http-error-factory';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AssetDefinition, EntityIdPathParam } from '../../client/generated';
import { SUPPORTED_ASSETS } from './additional-assets-handler';

export async function getAssetDetails(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<AssetDefinition | void> {
  const params = request.params as { id: EntityIdPathParam };
  const asset = SUPPORTED_ASSETS.find((asset) => asset.id === params.id);

  if (!asset) {
    return ErrorFactory.notFound(reply);
  }

  return asset;
}
