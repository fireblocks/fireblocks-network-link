/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AccountHolderDetails } from './AccountHolderDetails';
import type { InteracCapability } from './InteracCapability';
import type { InteractTransferDetailsOnRamp } from './InteractTransferDetailsOnRamp';

/**
 * When true, funds are deposited directly into the recipient's bank account without a security question.
 * When false, a security question and answer are required to complete the transfer
 */
export type InteracAddressPaymentInstruction = (InteracCapability & InteractTransferDetailsOnRamp & {
    accountHolder: AccountHolderDetails;
});

