/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CommonRampReceipt } from './CommonRampReceipt';
import type { RampFiatTransfer } from './RampFiatTransfer';

export type OffRampReceipt = (CommonRampReceipt & {
    payment: RampFiatTransfer;
});

