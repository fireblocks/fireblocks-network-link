/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CommonRamp } from './CommonRamp';
import type { FiatAddress } from './FiatAddress';
import type { OnRampProperties } from './OnRampProperties';
import type { PublicBlockchainTransaction } from './PublicBlockchainTransaction';
import type { RampFiatTransfer } from './RampFiatTransfer';

export type OnRampTransfer = (CommonRamp & OnRampProperties & {
    deliveryInstructions: (FiatAddress & {
        referenceId?: string;
    });
    delivery?: RampFiatTransfer;
    receipt?: PublicBlockchainTransaction;
});

