/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AccountStatus } from './AccountStatus';
import type { Balances } from './Balances';

export type Account = {
    id: string;
    title: string;
    description?: string;
    balances?: Balances;
    status: AccountStatus;
    /**
     * The ID of the parent account. If the field is empty, the account is a main account.
     */
    parentId?: string;
};

