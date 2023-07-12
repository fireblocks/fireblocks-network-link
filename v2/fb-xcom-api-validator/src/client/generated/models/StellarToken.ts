/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AssetCommonProperties } from './AssetCommonProperties';
import type { Blockchain } from './Blockchain';

export type StellarToken = (AssetCommonProperties & {
    type: StellarToken.type;
    blockchain: Blockchain;
    issuerAddress: string;
    stellarCurrencyCode: string;
});

export namespace StellarToken {

    export enum type {
        STELLAR_TOKEN = 'StellarToken',
    }


}

