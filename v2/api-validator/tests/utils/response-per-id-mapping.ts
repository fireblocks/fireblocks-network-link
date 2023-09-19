import { arrayFromAsyncGenerator, Pageable, paginated } from './pagination';

type IdBoundMethod<T> = (id: string, limit: number, startingAfter?: string) => Promise<T[]>;

export async function getResponsePerIdMapping<T>(
  method: IdBoundMethod<T>,
  idList: string[]
): Promise<Map<string, T[]>> {
  const responsePerAccountMap = new Map<string, T[]>();

  for (const id of idList) {
    const pageableMethod: Pageable<T> = async (limit, startingAfter?): Promise<T[]> => {
      return await method(id, limit, startingAfter);
    };

    const response = await arrayFromAsyncGenerator(paginated(pageableMethod));
    responsePerAccountMap.set(id, response);
  }

  return responsePerAccountMap;
}
