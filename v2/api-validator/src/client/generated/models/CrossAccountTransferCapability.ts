/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AssetReference } from './AssetReference';

export type CrossAccountTransferCapability = {
    asset: AssetReference;
    transferMethod: CrossAccountTransferCapability.transferMethod;
};

export namespace CrossAccountTransferCapability {

    export enum transferMethod {
        INTERNAL_TRANSFER = 'InternalTransfer',
        PEER_ACCOUNT_TRANSFER = 'PeerAccountTransfer',
    }


}

