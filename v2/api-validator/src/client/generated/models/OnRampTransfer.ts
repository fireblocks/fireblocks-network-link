/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CommonRamp } from './CommonRamp';
import type { OnRampProperties } from './OnRampProperties';
import type { PublicBlockchainTransaction } from './PublicBlockchainTransaction';
import type { RampFiatDestination } from './RampFiatDestination';
import type { RampFiatTransfer } from './RampFiatTransfer';

export type OnRampTransfer = (CommonRamp & OnRampProperties & {
    deliveryInstructions: RampFiatDestination;
    delivery?: RampFiatTransfer;
    receipt?: PublicBlockchainTransaction;
});

