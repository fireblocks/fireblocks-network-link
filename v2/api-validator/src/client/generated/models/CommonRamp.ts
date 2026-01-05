/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { OrderQuote } from './OrderQuote';
import type { PositiveAmount } from './PositiveAmount';
import type { RampFees } from './RampFees';
import type { RampStatus } from './RampStatus';

export type CommonRamp = {
    id: string;
    createdAt: string;
    updatedAt: string;
    status: RampStatus;
    amount: PositiveAmount;
    estimatedFees?: RampFees;
    executionDetails?: OrderQuote;
    /**
     * Ramp expiration time.
     */
    expiresAt: string;
};
