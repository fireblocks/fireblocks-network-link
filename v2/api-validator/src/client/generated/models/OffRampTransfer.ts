/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CommonRamp } from './CommonRamp';
import type { FiatTransfer } from './FiatTransfer';
import type { OffRampProperties } from './OffRampProperties';
import type { PublicBlockchainAddress } from './PublicBlockchainAddress';
import type { PublicBlockchainTransaction } from './PublicBlockchainTransaction';

export type OffRampTransfer = (CommonRamp & OffRampProperties & {
    deliveryInstructions: PublicBlockchainAddress;
    delivery?: PublicBlockchainTransaction;
    receipt?: FiatTransfer;
});

