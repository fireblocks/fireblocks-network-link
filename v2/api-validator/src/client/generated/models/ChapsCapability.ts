/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NationalCurrency } from './NationalCurrency';

export type ChapsCapability = {
    asset: NationalCurrency;
    transferMethod: ChapsCapability.transferMethod;
};

export namespace ChapsCapability {

    export enum transferMethod {
        CHAPS = 'Chaps',
    }


}

