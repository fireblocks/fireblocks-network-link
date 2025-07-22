/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AssetCommonProperties } from './AssetCommonProperties';
import type { Blockchain } from './Blockchain';

export type ContractBasedToken = (AssetCommonProperties & {
    type: ContractBasedToken.type;
    blockchain: Blockchain;
    contractAddress: string;
});

export namespace ContractBasedToken {

    export enum type {
        JETTON = 'Jetton',
    }


}

