import * as ErrorFactory from '../http-error-factory';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Ramp, RampMethod, RampRequest } from '../../client/generated';
import { ControllersContainer } from '../controllers/controllers-container';
import { RampNotFoundError, RampsController } from '../controllers/ramps-controller';
import {
  AccountIdPathParam,
  EntityIdPathParam,
  ListOrderQuerystring,
  PaginationQuerystring,
} from './request-types';
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

export async function getRampDetails(
  request: FastifyRequest<AccountIdPathParam & EntityIdPathParam>,
  reply: FastifyReply
): Promise<Ramp> {
  const { accountId, id: rampId } = request.params;

  const controller = controllers.getController(accountId);
  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  try {
    return controller.getRamp(rampId);
  } catch (err) {
    if (err instanceof RampNotFoundError) {
      return ErrorFactory.notFound(reply);
    }
    throw err;
  }
}

// createRamp
type CreateRampRequestBody = { Body: RampRequest };

export async function createRamp(
  { body, params }: FastifyRequest<AccountIdPathParam & CreateRampRequestBody>,
  reply: FastifyReply
): Promise<RampMethod> {
  const { accountId } = params;
  const controller = controllers.getController(accountId);
  if (!controller) {
    return ErrorFactory.notFound(reply);
  }

  return controller.createRamp(body);
}

// getRampDetails
