/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PublicBlockchainAddress } from './PublicBlockchainAddress';
import type { PublicBlockchainCapability } from './PublicBlockchainCapability';

export type BridgeProperties = {
    type: BridgeProperties.type;
    from: PublicBlockchainCapability;
    to: PublicBlockchainCapability;
    recipient: PublicBlockchainAddress;
};

export namespace BridgeProperties {

    export enum type {
        BRIDGE = 'Bridge',
    }


}

