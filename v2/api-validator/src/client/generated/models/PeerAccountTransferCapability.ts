/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AssetReference } from './AssetReference';

export type PeerAccountTransferCapability = {
    asset: AssetReference;
    transferMethod: PeerAccountTransferCapability.transferMethod;
};

export namespace PeerAccountTransferCapability {

    export enum transferMethod {
        PEER_ACCOUNT_TRANSFER = 'PeerAccountTransfer',
    }


}

