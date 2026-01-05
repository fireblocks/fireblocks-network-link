/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AccountHolderDetails } from './AccountHolderDetails';
import type { PayId } from './PayId';
import type { PayIdCapability } from './PayIdCapability';

export type PayIdAddress = (PayIdCapability & {
    accountHolder: AccountHolderDetails;
    payId: PayId;
});

