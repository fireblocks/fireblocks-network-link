/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NationalCurrency } from './NationalCurrency';

export type IbanCapability = {
    asset: NationalCurrency;
    transferMethod: IbanCapability.transferMethod;
};

export namespace IbanCapability {

    export enum transferMethod {
        IBAN = 'Iban',
    }


}

