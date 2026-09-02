/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FiatPaymentInstruction } from './FiatPaymentInstruction';
import type { OnRampProperties } from './OnRampProperties';

export type OnRampPropertiesWithPaymentInstructions = ({
    paymentInstructions: (FiatPaymentInstruction & {
        referenceId?: string;
    });
} & OnRampProperties);

