/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PrefundedBlockchainCapability } from './PrefundedBlockchainCapability';
import type { PublicBlockchainAddress } from './PublicBlockchainAddress';

export type PrefundedBridgeProperties = {
    type: PrefundedBridgeProperties.type;
    from: PrefundedBlockchainCapability;
    to: PublicBlockchainAddress;
};

export namespace PrefundedBridgeProperties {

    export enum type {
        BRIDGE = 'Bridge',
    }


}
