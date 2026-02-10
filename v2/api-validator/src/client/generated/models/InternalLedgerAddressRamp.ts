/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AccountHolderDetails } from './AccountHolderDetails';
import type { InternalLedgerCapability } from './InternalLedgerCapability';

export type InternalLedgerAddressRamp = (InternalLedgerCapability & {
    accountHolder: AccountHolderDetails;
    externalSubAccountId: string;
});

