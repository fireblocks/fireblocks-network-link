import config from '../../src/config';

const LIMIT = config.get('paginationLimit');
// Function supporting pagination
export type Pageable<T> = (limit: number, startingAfter?: string) => Promise<T[]>;
/**
 * Wraps a pageable function with a generator function, returning all the items
 * one by one while automagically managing the pagination behind the scene.
 */
export async function* paginated<T>(f: Pageable<T>, idPropName = 'id'): AsyncGenerator<T> {
  const MAX_PAGES = 1000;
  let pageCount = 0;
  let startingAfter: string | undefined;

  while (pageCount < MAX_PAGES) {
    const currentPage = await f(LIMIT, startingAfter);

    if (currentPage.length === 0) {
      break;
    }

    pageCount++;

    for (const item of currentPage) {
      yield item;
    }

    const lastItem = currentPage[currentPage.length - 1];
    const lastItemId = lastItem?.[idPropName];

    if (!lastItemId || lastItemId === startingAfter) {
      break;
    }

    startingAfter = lastItemId;
  }
}

export async function arrayFromAsyncGenerator<T>(generator: AsyncGenerator<T>): Promise<Array<T>> {
  const array: Array<T> = [];
  for await (const x of generator) {
    array.push(x);
  }
  return array;
}
