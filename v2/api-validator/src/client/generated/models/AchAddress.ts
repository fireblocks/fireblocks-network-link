/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AccountHolderDetails } from './AccountHolderDetails';
import type { AchCapability } from './AchCapability';

export type AchAddress = (AchCapability & {
    accountHolder: AccountHolderDetails;
    bankName?: string;
    bankAccountNumber: string;
    routingNumber: string;
    accountType: AchAddress.accountType;
});

export namespace AchAddress {

    export enum accountType {
        CHECKING = 'checking',
        SAVINGS = 'savings',
    }


}

