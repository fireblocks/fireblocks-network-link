/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FiatCapability } from './FiatCapability';
import type { FiatDepositDestination } from './FiatDepositDestination';
import type { PublicBlockchainCapability } from './PublicBlockchainCapability';

export type OffRampProperties = {
    type: OffRampProperties.type;
    from: PublicBlockchainCapability;
    to: FiatCapability;
    recipient: FiatDepositDestination;
};

export namespace OffRampProperties {

    export enum type {
        OFF_RAMP = 'OffRamp',
    }


}

