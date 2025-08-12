/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NationalCurrency } from './NationalCurrency';

export type MomoCapability = {
    asset: NationalCurrency;
    transferMethod: MomoCapability.transferMethod;
};

export namespace MomoCapability {

    export enum transferMethod {
        MOMO = 'Momo',
    }


}

