import { Pageable, paginated } from './pagination';

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

    const response: T[] = [];

    for await (const page of paginated(pageableMethod)) {
      response.push(page);
    }

    responsePerAccountMap.set(id, response);
  }

  return responsePerAccountMap;
}
