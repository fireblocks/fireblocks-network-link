/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AssetCommonProperties } from './AssetCommonProperties';
import type { Blockchain } from './Blockchain';

export type Bep20Token = (AssetCommonProperties & {
    type: Bep20Token.type;
    blockchain: Blockchain;
    contractAddress: string;
});

export namespace Bep20Token {

    export enum type {
        BEP20TOKEN = 'Bep20Token',
    }


}

