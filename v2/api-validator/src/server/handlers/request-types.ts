export type EntityIdPathParam = {
  Params: {
    id: string;
  };
};

export type PaginationQuerystring = {
  Querystring: {
    limit: number;
    startingAfter?: string;
    endingBefore?: string;
  };
};