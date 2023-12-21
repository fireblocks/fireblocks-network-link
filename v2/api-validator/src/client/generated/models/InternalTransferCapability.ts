/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AssetReference } from './AssetReference';
import type { InternalTransferCapabilityLimitation } from './InternalTransferCapabilityLimitation';

export type InternalTransferCapability = {
    asset: AssetReference;
    transferMethod: InternalTransferCapability.transferMethod;
    limitations?: InternalTransferCapabilityLimitation;
};

export namespace InternalTransferCapability {

    export enum transferMethod {
        INTERNAL_TRANSFER = 'InternalTransfer',
    }


}

