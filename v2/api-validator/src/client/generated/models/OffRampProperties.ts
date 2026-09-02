/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BlockchainCapabilityWithOptionalAddress } from './BlockchainCapabilityWithOptionalAddress';
import type { FiatAddress } from './FiatAddress';

export type OffRampProperties = {
    type: OffRampProperties.type;
    from: BlockchainCapabilityWithOptionalAddress;
    to: FiatAddress;
};

export namespace OffRampProperties {

    export enum type {
        OFF_RAMP = 'OffRamp',
    }


}

