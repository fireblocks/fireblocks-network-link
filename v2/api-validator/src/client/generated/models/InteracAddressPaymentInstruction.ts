/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AccountHolderDetails } from './AccountHolderDetails';
import type { InteracCapability } from './InteracCapability';
import type { InteractTransferDetailsOnRamp } from './InteractTransferDetailsOnRamp';

export type InteracAddressPaymentInstruction = (InteracCapability & InteractTransferDetailsOnRamp & {
    accountHolder: AccountHolderDetails;
});

