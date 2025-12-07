/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CommonRamp } from './CommonRamp';
import type { OffRampPropertiesWithPaymentInstructions } from './OffRampPropertiesWithPaymentInstructions';
import type { OffRampReceipt } from './OffRampReceipt';
import type { PrefundedOffRampProperties } from './PrefundedOffRampProperties';

export type OffRamp = (CommonRamp & (OffRampPropertiesWithPaymentInstructions | PrefundedOffRampProperties) & {
    receipt?: OffRampReceipt;
});

