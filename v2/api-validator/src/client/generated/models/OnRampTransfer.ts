/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CommonRamp } from './CommonRamp';
import type { FiatDepositDestination } from './FiatDepositDestination';
import type { FiatTransfer } from './FiatTransfer';
import type { OnRampProperties } from './OnRampProperties';
import type { PublicBlockchainTransaction } from './PublicBlockchainTransaction';

export type OnRampTransfer = (CommonRamp & OnRampProperties & {
    deliveryInstructions: FiatDepositDestination;
    delivery?: FiatTransfer;
    receipt?: PublicBlockchainTransaction;
});

