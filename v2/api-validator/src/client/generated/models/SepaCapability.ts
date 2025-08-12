/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NationalCurrency } from './NationalCurrency';

export type SepaCapability = {
    asset: NationalCurrency;
    transferMethod: SepaCapability.transferMethod;
};

export namespace SepaCapability {

    export enum transferMethod {
        SEPA = 'Sepa',
    }


}

