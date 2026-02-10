/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NationalCurrency } from './NationalCurrency';

export type InternalLedgerCapability = {
    asset: NationalCurrency;
    transferMethod: InternalLedgerCapability.transferMethod;
};

export namespace InternalLedgerCapability {

    export enum transferMethod {
        INTERNAL_LEDGER = 'InternalLedger',
    }


}

