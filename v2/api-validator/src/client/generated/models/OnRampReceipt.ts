/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CommonRampReceipt } from './CommonRampReceipt';
import type { PublicBlockchainTransaction } from './PublicBlockchainTransaction';

export type OnRampReceipt = (CommonRampReceipt & {
    payment: PublicBlockchainTransaction;
});

