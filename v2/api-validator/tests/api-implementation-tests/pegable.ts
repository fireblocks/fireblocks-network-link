const LIMIT = 1;

export type Pageable<T> = (limit: number, startingAfter?: string) => Promise<T[]>;

export async function* paginated<T>(f: Pageable<T>, idPropName = 'id') {
  let page = await f(LIMIT);
  while (page.length > 0) {
    for (const item of page) {
      yield item;
    }
    const startingAfter = page.at(-1)?.[idPropName];
    page = await f(LIMIT, startingAfter);
  }
}
