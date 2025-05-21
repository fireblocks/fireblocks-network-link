/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AccountHolderDetails } from './AccountHolderDetails';
import type { AchCapability } from './AchCapability';
import type { PostalAddress } from './PostalAddress';

export type AchAddress = (AchCapability & {
    accountHolder: AccountHolderDetails;
    bankName?: string;
    bankAccountNumber: string;
    routingNumber: string;
    accountType: AchAddress.accountType;
    address: PostalAddress;
});

export namespace AchAddress {

    export enum accountType {
        CHECKING = 'checking',
        SAVINGS = 'savings',
    }


}

