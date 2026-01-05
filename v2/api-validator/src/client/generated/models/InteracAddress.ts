/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AccountHolderDetails } from './AccountHolderDetails';
import type { InteracCapability } from './InteracCapability';
import type { InteracTransferDetails } from './InteracTransferDetails';

export type InteracAddress = (InteracCapability & {
    accountHolder: AccountHolderDetails;
    interacTransfer: InteracTransferDetails;
});

