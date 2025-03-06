import * as ErrorFactory from '../http-error-factory';
import { FastifyReply, FastifyRequest } from 'fastify';
import { RampMethod } from '../../client/generated';
import { ControllersContainer } from '../controllers/controllers-container';
import { RampsController } from '../controllers/ramps-controller';
import { AccountIdPathParam, PaginationQuerystring } from './request-types';
import { getPaginationResult } from '../controllers/pagination-controller';

const controllers = new ControllersContainer(() => new RampsController());
type RampMethodResponse = { capabilities: RampMethod[] };

export async function getRampMethods(
  request: FastifyRequest<AccountIdPathParam & PaginationQuerystring>,
  reply: FastifyReply
): Promise<RampMethodResponse> {
  const { limit, startingAfter, endingBefore } = request.query;
  const { accountId } = request.params;

  const controller = controllers.getController(accountId);
  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  return {
    capabilities: getPaginationResult(
      limit,
      startingAfter,
      endingBefore,
      controller.getRampMethods(),
      'id'
    ),
  };
}
// getRamps

// createRamp

// getRampDetails
