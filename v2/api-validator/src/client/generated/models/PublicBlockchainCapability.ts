/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AssetReference } from './AssetReference';

export type PublicBlockchainCapability = {
    asset: AssetReference;
    transferMethod: PublicBlockchainCapability.transferMethod;
};

export namespace PublicBlockchainCapability {

    export enum transferMethod {
        PUBLIC_BLOCKCHAIN = 'PublicBlockchain',
    }


}

