/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BridgePropertiesWithPaymentInstructions } from './BridgePropertiesWithPaymentInstructions';
import type { BridgeReceipt } from './BridgeReceipt';
import type { CommonRamp } from './CommonRamp';
import type { PrefundedBridgeProperties } from './PrefundedBridgeProperties';

export type Bridge = (CommonRamp & (BridgePropertiesWithPaymentInstructions | PrefundedBridgeProperties) & {
    receipt?: BridgeReceipt;
});

