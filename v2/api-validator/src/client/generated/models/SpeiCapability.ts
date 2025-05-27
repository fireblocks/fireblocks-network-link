/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NationalCurrency } from './NationalCurrency';

export type SpeiCapability = {
    asset: NationalCurrency;
    transferMethod: SpeiCapability.transferMethod;
};

export namespace SpeiCapability {

    export enum transferMethod {
        SPEI = 'Spei',
    }


}

