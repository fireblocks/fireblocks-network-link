import {
  InvalidPaginationParamsCombinationError,
  getPaginationResult,
  validatePaginationParams,
} from '../../src/server/controllers/pagination-controller';

describe('Pagination', () => {
  describe('Validate pagination parameters', () => {
    const defaultLimit = 10;
    const nonEmptyStartingAfter = 'any-value-works';
    const nonEmptyEndingBefore = 'any-value-works';

    it('should return invalid result when both startingAfter and endingBefore options are used', () => {
      expect(() => {
        validatePaginationParams(10, nonEmptyStartingAfter, nonEmptyEndingBefore);
      }).toThrow(InvalidPaginationParamsCombinationError);
    });

    it('should return valid with only startingAfter', () => {
      expect(() => {
        validatePaginationParams(defaultLimit, nonEmptyStartingAfter, undefined);
      }).not.toThrow();
    });

    it('should return valid with only endingBefore', () => {
      expect(() => {
        validatePaginationParams(defaultLimit, undefined, nonEmptyEndingBefore);
      }).not.toThrow();
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
        console.log(page);
        expect(page.length).toBe(4);
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
        expect(page.length).toBe(4);
      });
    });
  });
});
