/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AccountHolderDetails } from './AccountHolderDetails';
import type { InteracTransferCapability } from './InteracTransferCapability';
import type { InteracTransferDetails } from './InteracTransferDetails';

export type InteracTransferAddress = (InteracTransferCapability & {
    accountHolder: AccountHolderDetails;
    interacTransfer?: InteracTransferDetails;
});

