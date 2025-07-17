/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FiatAddress } from './FiatAddress';
import type { PrefundedBlockchainCapability } from './PrefundedBlockchainCapability';

export type PrefundedOffRampProperties = {
    type: PrefundedOffRampProperties.type;
    from: PrefundedBlockchainCapability;
    to: FiatAddress;
};

export namespace PrefundedOffRampProperties {

    export enum type {
        OFF_RAMP = 'OffRamp',
    }


}

