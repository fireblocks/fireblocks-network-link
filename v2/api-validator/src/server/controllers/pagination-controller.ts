import { BadRequestError, RequestPart } from '../../client/generated';
import { XComError } from '../../error';

export type PaginationParams = {
  limit: number;
  startingAfter?: string;
  endingBefore?: string;
};

export const ENDING_STARTING_COMBINATION_ERROR: BadRequestError = {
  message: 'Cannot use startingAfter with endingBefore',
  errorType: BadRequestError.errorType.SCHEMA_ERROR,
  requestPart: RequestPart.QUERYSTRING,
};

export class InvalidPaginationParamsCombinationError extends XComError {
  constructor() {
    super('Cannot specify both startingAfter and endingBefore');
  }
}

export function getPaginationResult<T>(
  limit: number,
  startingAfter: string | undefined,
  endingBefore: string | undefined,
  data: T[],
  idProp: keyof T
): T[] {
  validatePaginationParams(limit, startingAfter, endingBefore);

  if (startingAfter) {
    return paginationResultWithStartingAfter(limit, startingAfter, data, idProp);
  }
  if (endingBefore) {
    return paginationResultWithEndingBefore(limit, endingBefore, data, idProp);
  }

  const start = 0;
  const end = Math.min(limit, data.length);

  return data.slice(start, end);
}

function paginationResultWithStartingAfter<T>(
  limit: number,
  startingAfter: string,
  data: T[],
  idProp: keyof T
) {
  const offset = data.findIndex((item) => item[idProp] === startingAfter);
  if (offset === -1) {
    return [];
  }
  const start = Math.min(offset + 1, data.length);
  const end = Math.min(start + limit, data.length);

  return data.slice(start, end);
}

function paginationResultWithEndingBefore<T>(
  limit: number,
  endingBefore: string,
  data: T[],
  idProp: keyof T
) {
  const offset = data.findIndex((item) => item[idProp] === endingBefore);
  if (offset === -1) {
    return [];
  }
  const end = Math.max(offset, 0);
  const start = Math.max(end - limit, 0);

  return data.slice(start, end);
}

export function validatePaginationParams(
  limit: number,
  startingAfter: string | undefined,
  endingBefore: string | undefined
): void {
  if (startingAfter && endingBefore) {
    throw new InvalidPaginationParamsCombinationError();
  }
}
