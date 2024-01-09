/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AccountsSet } from './AccountsSet';

/**
 * Lists supported API components and which sub-accounts support the component.
 */
export type ApiComponents = {
    accounts: AccountsSet;
    balances: AccountsSet;
    historicBalances?: AccountsSet;
    transfers?: AccountsSet;
    transfersBlockchain?: AccountsSet;
    transfersFiat?: AccountsSet;
    transfersPeerAccounts?: AccountsSet;
    transfersInternal?: AccountsSet;
    trading?: AccountsSet;
    liquidity?: AccountsSet;
};

