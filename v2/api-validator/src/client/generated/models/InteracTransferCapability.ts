/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NationalCurrency } from './NationalCurrency';

export type InteracTransferCapability = {
    asset: NationalCurrency;
    transferMethod: InteracTransferCapability.transferMethod;
};

export namespace InteracTransferCapability {

    export enum transferMethod {
        INTERAC = 'Interac',
    }


}

