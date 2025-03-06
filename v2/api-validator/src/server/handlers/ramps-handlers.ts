import * as ErrorFactory from '../http-error-factory';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Ramp, RampMethod } from '../../client/generated';
import { ControllersContainer } from '../controllers/controllers-container';
import { RampsController } from '../controllers/ramps-controller';
import { AccountIdPathParam, ListOrderQuerystring, PaginationQuerystring } from './request-types';
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

export async function getRamps(
  request: FastifyRequest<AccountIdPathParam & PaginationQuerystring & ListOrderQuerystring>,
  reply: FastifyReply
): Promise<{ ramps: Ramp[] }> {
  const { limit, startingAfter, endingBefore, order } = request.query;
  const { accountId } = request.params;

  const controller = controllers.getController(accountId);
  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  return {
    ramps: getPaginationResult(
      limit,
      startingAfter,
      endingBefore,
      controller.getRamps(order),
      'id'
    ),
  };
}
// createRamp

// getRampDetails
