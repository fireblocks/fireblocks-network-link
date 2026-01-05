/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CryptocurrencyReference } from './CryptocurrencyReference';

export type PrefundedBlockchainCapability = {
    asset: CryptocurrencyReference;
    type: PrefundedBlockchainCapability.type;
};

export namespace PrefundedBlockchainCapability {

    export enum type {
        PREFUNDED = 'Prefunded',
    }


}
