/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CryptocurrencyReference } from './CryptocurrencyReference';

export type PublicBlockchainCapability = {
    asset: CryptocurrencyReference;
    transferMethod: PublicBlockchainCapability.transferMethod;
};

export namespace PublicBlockchainCapability {

    export enum transferMethod {
        PUBLIC_BLOCKCHAIN = 'PublicBlockchain',
    }


}
