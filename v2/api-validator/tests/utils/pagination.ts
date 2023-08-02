const LIMIT = 2;

// Function supporting pagination
export type Pageable<T> = (limit: number, startingAfter?: string) => Promise<T[]>;

/**
 * Wraps a pageable function with a generator function, returning all the items
 * one by one while automagically managing the pagination behind the scene.
 */
export async function* paginated<T>(f: Pageable<T>, idPropName = 'id'): AsyncGenerator<T> {
  let page = await f(LIMIT);
  while (page.length > 0) {
    for (const item of page) {
      yield item;
    }
    const startingAfter = page.at(-1)?.[idPropName];
    page = await f(LIMIT, startingAfter);
  }
}

export async function arrayFromAsyncGenerator<T>(generator: AsyncGenerator<T>): Promise<Array<T>> {
  const array: Array<T> = [];
  for await (const x of generator) {
    array.push(x);
  }
  return array;
}
