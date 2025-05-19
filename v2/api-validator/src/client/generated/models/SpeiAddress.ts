/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AccountHolderDetails } from './AccountHolderDetails';
import type { PostalAddress } from './PostalAddress';
import type { SpeiCapability } from './SpeiCapability';

export type SpeiAddress = (SpeiCapability & {
    accountHolder: AccountHolderDetails;
    bankName?: string;
    bankAccountNumber: string;
    address: PostalAddress;
});

