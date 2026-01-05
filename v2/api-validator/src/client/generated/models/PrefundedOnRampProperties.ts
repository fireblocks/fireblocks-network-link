/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PrefundedFiatCapability } from './PrefundedFiatCapability';
import type { PublicBlockchainAddress } from './PublicBlockchainAddress';

export type PrefundedOnRampProperties = {
    type: PrefundedOnRampProperties.type;
    from: PrefundedFiatCapability;
    to: PublicBlockchainAddress;
};

export namespace PrefundedOnRampProperties {

    export enum type {
        ON_RAMP = 'OnRamp',
    }


}
