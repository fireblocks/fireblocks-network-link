import { DepositAddressesSymbolQueryParam, DepositAddressesBlockchainQueryParam } from "../../client/generated";

export type EntityIdPathParam = {
  Params: {
    id: string;
  };
};

export type AccountIdPathParam = {
  Params: {
    accountId: string;
  };
};

export type CollateralIdPathParam = {
  Params: {
    collateralId: string;
  };
};

export type CollateralTxIdPathParam = {
  Params: {
    collateralTxId: string;
  };
};

export type SettlementVersionPathParam = {
  Params: {
    settlementVersion: string;
  };
};

export type PaginationQuerystring = {
  Querystring: {
    limit: number;
    startingAfter?: string;
    endingBefore?: string;
  };
};

export type ListOrderQuerystring = {
  Querystring: {
    order: 'asc' | 'desc';
  };
};

export type DepositAddressesQuerystring = {
  Querystring: {
    cryptocurrencySymbol?: DepositAddressesSymbolQueryParam;
    blockchain?: DepositAddressesBlockchainQueryParam;
  };
};
