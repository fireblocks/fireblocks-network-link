/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PrefundedOnRampFrom } from './PrefundedOnRampFrom';
import type { PublicBlockchainAddress } from './PublicBlockchainAddress';

export type PrefundedOnRampProperties = {
    type: PrefundedOnRampProperties.type;
    from: PrefundedOnRampFrom;
    to: PublicBlockchainAddress;
};

export namespace PrefundedOnRampProperties {

    export enum type {
        ON_RAMP = 'OnRamp',
    }


}

