/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AccountHolderDetails } from './AccountHolderDetails';
import type { AchCapability } from './AchCapability';
import type { bankAccountNumber } from './bankAccountNumber';
import type { routingNumber } from './routingNumber';

export type AchAddress = (AchCapability & {
    accountHolder: AccountHolderDetails;
    bankName?: string;
    bankAccountNumber: bankAccountNumber;
    routingNumber: routingNumber;
    accountType: AchAddress.accountType;
});

export namespace AchAddress {

    export enum accountType {
        CHECKING = 'Checking',
        SAVINGS = 'Savings',
    }


}

