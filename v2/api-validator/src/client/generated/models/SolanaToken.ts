/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AssetCommonProperties } from './AssetCommonProperties';
import type { Blockchain } from './Blockchain';

export type SolanaToken = (AssetCommonProperties & {
type: SolanaToken.type;
blockchain: Blockchain;
mintAddress: string;
});

export namespace SolanaToken {

    export enum type {
        SPL_TOKEN = 'SplToken',
    }


}
