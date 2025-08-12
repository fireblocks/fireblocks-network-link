/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NationalCurrency } from './NationalCurrency';

export type AbaCapability = {
    asset: NationalCurrency;
    transferMethod: AbaCapability.transferMethod;
};

export namespace AbaCapability {

    export enum transferMethod {
        ABA = 'Aba',
    }


}

