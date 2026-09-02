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
    failureReason?: CommonRamp.failureReason;
};

export namespace CommonRamp {

    export enum failureReason {
        UNSUPPORTED_RAMP_METHOD = 'unsupported-ramp-method',
        UNSUPPORTED_SOURCE_ASSET = 'unsupported-source-asset',
        UNSUPPORTED_DESTINATION_ASSET = 'unsupported-destination-asset',
        AMOUNT_BELOW_MINIMUM = 'amount-below-minimum',
        PII_MISSING = 'pii-missing',
        UNSUPPORTED_EXTERNAL_SOURCE = 'unsupported-external-source',
        UNSUPPORTED_REGION = 'unsupported-region',
        DESTINATION_NOT_WHITELISTED = 'destination-not-whitelisted',
    }


}

