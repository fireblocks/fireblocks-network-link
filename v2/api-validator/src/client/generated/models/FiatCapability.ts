/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NationalCurrency } from './NationalCurrency';

export type FiatCapability = {
    asset: NationalCurrency;
    transferMethod: FiatCapability.transferMethod;
};

export namespace FiatCapability {

    export enum transferMethod {
        IBAN = 'Iban',
        SWIFT = 'Swift',
    }


}

