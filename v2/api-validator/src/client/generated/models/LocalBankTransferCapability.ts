/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NationalCurrency } from './NationalCurrency';

/**
 * Local Bank Transfer Capability
 */
export type LocalBankTransferCapability = {
    asset: NationalCurrency;
    transferMethod: LocalBankTransferCapability.transferMethod;
};

export namespace LocalBankTransferCapability {

    export enum transferMethod {
        LBT = 'Lbt',
    }


}

