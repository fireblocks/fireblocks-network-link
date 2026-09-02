/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PrefundedBridgeFrom } from './PrefundedBridgeFrom';
import type { PublicBlockchainAddress } from './PublicBlockchainAddress';

export type PrefundedBridgeProperties = {
    type: PrefundedBridgeProperties.type;
    from: PrefundedBridgeFrom;
    to: PublicBlockchainAddress;
};

export namespace PrefundedBridgeProperties {

    export enum type {
        BRIDGE = 'Bridge',
    }


}

