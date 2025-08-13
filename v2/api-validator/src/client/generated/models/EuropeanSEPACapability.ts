/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NationalCurrency } from './NationalCurrency';

export type EuropeanSEPACapability = {
    asset: NationalCurrency;
    transferMethod: EuropeanSEPACapability.transferMethod;
};

export namespace EuropeanSEPACapability {

    export enum transferMethod {
        EUROPEAN_SEPA = 'EuropeanSEPA',
    }


}

