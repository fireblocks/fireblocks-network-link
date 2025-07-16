/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CommonRamp } from './CommonRamp';
import type { OnRampPropertiesWithPaymentInstructions } from './OnRampPropertiesWithPaymentInstructions';
import type { PrefundedOnRampProperties } from './PrefundedOnRampProperties';
import type { PublicBlockchainTransaction } from './PublicBlockchainTransaction';
import type { RampFiatTransfer } from './RampFiatTransfer';

export type OnRamp = (CommonRamp & (OnRampPropertiesWithPaymentInstructions | PrefundedOnRampProperties) & {
    payment?: RampFiatTransfer;
    receipt?: PublicBlockchainTransaction;
});

