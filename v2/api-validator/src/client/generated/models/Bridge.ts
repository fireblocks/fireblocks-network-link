/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BridgePropertiesWithPaymentInstructions } from './BridgePropertiesWithPaymentInstructions';
import type { CommonRamp } from './CommonRamp';
import type { PrefundedBridgeProperties } from './PrefundedBridgeProperties';
import type { PublicBlockchainTransaction } from './PublicBlockchainTransaction';

export type Bridge = (CommonRamp & (BridgePropertiesWithPaymentInstructions | PrefundedBridgeProperties) & {
    payment?: PublicBlockchainTransaction;
    receipt?: PublicBlockchainTransaction;
});

