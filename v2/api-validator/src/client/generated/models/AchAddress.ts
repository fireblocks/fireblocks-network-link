/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AccountHolderDetails } from './AccountHolderDetails';
import type { AchCapability } from './AchCapability';
import type { BankAccountNumber } from './BankAccountNumber';
import type { RoutingNumber } from './RoutingNumber';

export type AchAddress = (AchCapability & {
accountHolder: AccountHolderDetails;
bankName?: string;
bankAccountNumber: BankAccountNumber;
routingNumber: RoutingNumber;
accountType: AchAddress.accountType;
});

export namespace AchAddress {

    export enum accountType {
        CHECKING = 'Checking',
        SAVINGS = 'Savings',
    }


}
