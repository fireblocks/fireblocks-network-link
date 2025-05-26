/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AccountHolderDetails } from './AccountHolderDetails';
import type { CLABE } from './CLABE';
import type { SpeiCapability } from './SpeiCapability';

export type SpeiAddress = (SpeiCapability & {
    accountHolder: AccountHolderDetails;
    bankName?: string;
    bankAccountNumber: CLABE;
});

