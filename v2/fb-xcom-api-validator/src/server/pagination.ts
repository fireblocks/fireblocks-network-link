import { BadRequestError, RequestPart } from '../client/generated';

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

export const INVALID_LIMIT_ERROR: BadRequestError = {
  message: 'Limit must be between 1 and 200',
  errorType: BadRequestError.errorType.SCHEMA_PROPERTY_ERROR,
  requestPart: RequestPart.QUERYSTRING,
  propertyName: 'limit',
};

export function getPaginationResult<T>(
  limit: number,
  startingAfter: string | undefined,
  endingBefore: string | undefined,
  data: T[],
  idProp: string
): T[] {
  let start = 0;
  let end = Math.min(limit, data.length);

  if (startingAfter) {
    const offset = data.findIndex((item) => item[idProp] === startingAfter);
    if (offset === -1) {
      return [];
    }
    start = Math.min(offset + 1, data.length);
    end = Math.min(start + limit, data.length);
  } else if (endingBefore) {
    const offset = data.findIndex((item) => item[idProp] === endingBefore);
    if (offset === -1) {
      return [];
    }
    end = Math.max(offset, 0);
    start = Math.max(end - limit, 0);
  }

  return data.slice(start, end);
}

export function validatePaginationParams(
  limit: number,
  startingAfter: string | undefined,
  endingBefore: string | undefined
): { valid: boolean; error?: BadRequestError } {
  if (startingAfter && endingBefore) {
    return {
      valid: false,
      error: ENDING_STARTING_COMBINATION_ERROR,
    };
  }
  if (limit < 1 || limit > 200) {
    return {
      valid: false,
      error: INVALID_LIMIT_ERROR,
    };
  }
  return { valid: true };
}
