/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AccountHolderDetails } from './AccountHolderDetails';
import type { InteracCapability } from './InteracCapability';
import type { InteractTransferDetailsOffRamp } from './InteractTransferDetailsOffRamp';

export type InteracAddress = (InteracCapability & InteractTransferDetailsOffRamp & {
    accountHolder: AccountHolderDetails;
});

