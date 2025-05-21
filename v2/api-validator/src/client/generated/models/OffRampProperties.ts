/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FiatCapability } from './FiatCapability';
import type { PublicBlockchainCapability } from './PublicBlockchainCapability';
import type { RampFiatDestination } from './RampFiatDestination';

export type OffRampProperties = {
    type: OffRampProperties.type;
    from: PublicBlockchainCapability;
    to: FiatCapability;
    recipient: RampFiatDestination;
};

export namespace OffRampProperties {

    export enum type {
        OFF_RAMP = 'OffRamp',
    }


}

