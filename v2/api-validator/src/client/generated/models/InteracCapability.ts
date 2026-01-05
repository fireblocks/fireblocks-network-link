/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NationalCurrency } from './NationalCurrency';

export type InteracCapability = {
    asset: NationalCurrency;
    transferMethod: InteracCapability.transferMethod;
};

export namespace InteracCapability {

    export enum transferMethod {
        INTERAC = 'Interac',
    }


}

