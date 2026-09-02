/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AccountHolderDetails } from './AccountHolderDetails';
import type { ChapsAccountNumber } from './ChapsAccountNumber';
import type { ChapsBankAccountCountry } from './ChapsBankAccountCountry';
import type { ChapsBankAccountHolderName } from './ChapsBankAccountHolderName';
import type { ChapsCapability } from './ChapsCapability';
import type { ChapsSortCode } from './ChapsSortCode';

export type ChapsAddress = (ChapsCapability & {
    accountHolder: AccountHolderDetails;
    accountNumber: ChapsAccountNumber;
    sortCode: ChapsSortCode;
    bankAccountCountry: ChapsBankAccountCountry;
    bankAccountHolderName: ChapsBankAccountHolderName;
    /**
     * Optional bank name
     */
    bankName?: string;
});

