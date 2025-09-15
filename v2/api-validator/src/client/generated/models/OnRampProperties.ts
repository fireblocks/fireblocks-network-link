/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { OnRampFrom } from './OnRampFrom';
import type { PublicBlockchainAddress } from './PublicBlockchainAddress';

export type OnRampProperties = {
    type: OnRampProperties.type;
    from: OnRampFrom;
    to: PublicBlockchainAddress;
};

export namespace OnRampProperties {

    export enum type {
        ON_RAMP = 'OnRamp',
    }


}

