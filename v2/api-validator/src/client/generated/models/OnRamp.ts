/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CommonRamp } from './CommonRamp';
import type { OnRampPropertiesWithPaymentInstructions } from './OnRampPropertiesWithPaymentInstructions';
import type { OnRampReceipt } from './OnRampReceipt';
import type { PrefundedOnRampProperties } from './PrefundedOnRampProperties';

export type OnRamp = (CommonRamp & (OnRampPropertiesWithPaymentInstructions | PrefundedOnRampProperties) & {
    receipt?: OnRampReceipt;
});

