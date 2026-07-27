/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AccountHolderDetails } from './AccountHolderDetails';
import type { FpsUkAccountNumber } from './FpsUkAccountNumber';
import type { FpsUkBankAccountCountry } from './FpsUkBankAccountCountry';
import type { FpsUkCapability } from './FpsUkCapability';
import type { FpsUkSortCode } from './FpsUkSortCode';

export type FpsUkAddress = (FpsUkCapability & {
    accountHolder: AccountHolderDetails;
    accountNumber: FpsUkAccountNumber;
    sortCode: FpsUkSortCode;
    bankAccountCountry?: FpsUkBankAccountCountry;
    /**
     * Optional bank name
     */
    bankName?: string;
});

