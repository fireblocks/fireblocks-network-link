import {
  ENDING_STARTING_COMBINATION_ERROR,
  INVALID_LIMIT_ERROR,
  getPaginationResult,
  validatePaginationParams,
} from '../src/server/pagination';

describe('Pagination', () => {
  describe('Validate pagination parameters', () => {
    const defaultLimit = 10;
    const nonEmptyStartingAfter = 'any-value-works';
    const nonEmptyEndingBefore = 'any-value-works';

    describe('Limit', () => {
      it('should return invalid limit error when limit < 1', () => {
        const limit = 0;
        const { valid, error } = validatePaginationParams(limit, undefined, undefined);
        expect(valid).toBe(false);
        expect(error).toBe(INVALID_LIMIT_ERROR);
      });

      it('should return invalid limit error when limit > 200', () => {
        const limit = 201;
        const { valid, error } = validatePaginationParams(limit, undefined, undefined);
        expect(valid).toBe(false);
        expect(error).toBe(INVALID_LIMIT_ERROR);
      });

      it.each([1, 5, 10, 50, 100, 200])('should return valid when 1 <= limit <= 200', (limit) => {
        const { valid, error } = validatePaginationParams(limit, undefined, undefined);
        expect(valid).toBe(true);
        expect(error).toBeUndefined();
      });
    });

    it('should return invalid result when both startingAfter and endingBefore options are used', () => {
      const { valid, error } = validatePaginationParams(
        10,
        nonEmptyStartingAfter,
        nonEmptyEndingBefore
      );
      expect(valid).toBe(false);
      expect(error).toBe(ENDING_STARTING_COMBINATION_ERROR);
    });

    it('should return valid with only startingAfter', () => {
      const { valid, error } = validatePaginationParams(
        defaultLimit,
        nonEmptyStartingAfter,
        undefined
      );
      expect(valid).toBe(true);
      expect(error).toBeUndefined();
    });

    it('should return valid with only endingBefore', () => {
      const { valid, error } = validatePaginationParams(
        defaultLimit,
        undefined,
        nonEmptyEndingBefore
      );
      expect(valid).toBe(true);
      expect(error).toBeUndefined();
    });
  });

  describe('Create page', () => {
    const data: { id: string }[] = [
      {
        id: '1',
      },
      {
        id: '2',
      },
      {
        id: '3',
      },
      {
        id: '4',
      },
      {
        id: '5',
      },
    ];
    const idProp = 'id';
    const defaultLimit = 10;

    describe.each([1, 2, 3, 4, 5])('Limit %d', (limit) => {
      it('should return page of size limit', () => {
        const page = getPaginationResult(limit, undefined, undefined, data, idProp);
        expect(page.length).toBe(limit);
      });
    });

    describe('startingAfter', () => {
      it('should return empty list when id of last item in list is passed', () => {
        const page = getPaginationResult(defaultLimit, '5', undefined, data, idProp);
        expect(page.length).toBe(0);
      });

      it('should return list starting with the next item', () => {
        const index = 0;
        const page = getPaginationResult(defaultLimit, data[index].id, undefined, data, idProp);
        expect(page[0].id).toBe(data[index + 1].id);
      });
    });

    describe('endingBefore', () => {
      it('should return empty list when id of first item in list is passed', () => {
        const page = getPaginationResult(defaultLimit, undefined, '1', data, idProp);
        expect(page.length).toBe(0);
      });

      it('should return list ending with the previous item', () => {
        const index = 4;
        const page = getPaginationResult(defaultLimit, undefined, data[index].id, data, idProp);
        expect(page[page.length - 1].id).toBe(data[index - 1].id);
      });
    });
  });
});
