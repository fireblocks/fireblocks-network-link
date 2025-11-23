/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PublicBlockchainTransaction } from './PublicBlockchainTransaction';
import type { RampFees } from './RampFees';

export type OnRampReceipt = (PublicBlockchainTransaction & {
    actualFees?: RampFees;
});

