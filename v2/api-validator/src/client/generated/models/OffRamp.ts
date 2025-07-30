/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CommonRamp } from './CommonRamp';
import type { OffRampPropertiesWithPaymentInstructions } from './OffRampPropertiesWithPaymentInstructions';
import type { PrefundedOffRampProperties } from './PrefundedOffRampProperties';
import type { RampFiatTransfer } from './RampFiatTransfer';

export type OffRamp = (CommonRamp & (OffRampPropertiesWithPaymentInstructions | PrefundedOffRampProperties) & {
    receipt?: RampFiatTransfer;
});

