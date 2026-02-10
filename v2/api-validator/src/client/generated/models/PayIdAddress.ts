/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AccountHolderDetails } from './AccountHolderDetails';
import type { PayIdCapability } from './PayIdCapability';

export type PayIdAddress = (PayIdCapability & {
    accountHolder: AccountHolderDetails;
    type: PayIdAddress.type;
    /**
     * PayId value
     */
    value: string;
    /**
     * BSB value
     */
    bsb?: string;
    /**
     * Account number value
     */
    accountNumber: string;
});

export namespace PayIdAddress {

    export enum type {
        EMAIL = 'email',
    }


}

