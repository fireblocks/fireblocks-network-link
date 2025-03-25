/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BridgeProperties } from './BridgeProperties';
import type { CommonRamp } from './CommonRamp';
import type { PublicBlockchainAddress } from './PublicBlockchainAddress';
import type { PublicBlockchainTransaction } from './PublicBlockchainTransaction';

export type BridgeTransfer = (CommonRamp & BridgeProperties & {
    deliveryInstructions: PublicBlockchainAddress;
    delivery?: PublicBlockchainTransaction;
    receipt?: PublicBlockchainTransaction;
});

