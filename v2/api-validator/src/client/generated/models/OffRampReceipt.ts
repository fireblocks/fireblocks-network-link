/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { RampFees } from './RampFees';
import type { RampFiatTransfer } from './RampFiatTransfer';

export type OffRampReceipt = (RampFiatTransfer & {
    actualFees?: RampFees;
});

