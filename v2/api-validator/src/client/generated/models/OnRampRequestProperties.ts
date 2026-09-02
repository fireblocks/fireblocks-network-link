/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { OnRampRequestFrom } from './OnRampRequestFrom';
import type { PublicBlockchainAddress } from './PublicBlockchainAddress';

export type OnRampRequestProperties = {
    type: OnRampRequestProperties.type;
    from: OnRampRequestFrom;
    to: PublicBlockchainAddress;
};

export namespace OnRampRequestProperties {

    export enum type {
        ON_RAMP = 'OnRamp',
    }


}

