/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FiatAddress } from './FiatAddress';
import type { FiatCapability } from './FiatCapability';
import type { PublicBlockchainCapability } from './PublicBlockchainCapability';

export type OffRampProperties = {
    type: OffRampProperties.type;
    from: PublicBlockchainCapability;
    to: FiatCapability;
    recipient: FiatAddress;
};

export namespace OffRampProperties {

    export enum type {
        OFF_RAMP = 'OffRamp',
    }


}

