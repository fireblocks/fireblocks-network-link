/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BlockchainCapabilityWithOptionalAddress } from './BlockchainCapabilityWithOptionalAddress';
import type { PublicBlockchainAddress } from './PublicBlockchainAddress';

export type BridgeProperties = {
    type: BridgeProperties.type;
    from: BlockchainCapabilityWithOptionalAddress;
    to: PublicBlockchainAddress;
};

export namespace BridgeProperties {

    export enum type {
        BRIDGE = 'Bridge',
    }


}

