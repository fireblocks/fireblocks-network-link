/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AssetReference } from './AssetReference';

export type InternalTransferMethod = {
    asset: AssetReference;
    transferMethod: InternalTransferMethod.transferMethod;
};

export namespace InternalTransferMethod {

    export enum transferMethod {
        INTERNAL_TRANSFER = 'InternalTransfer',
    }


}

