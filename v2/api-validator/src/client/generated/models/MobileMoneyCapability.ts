/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NationalCurrency } from './NationalCurrency';

export type MobileMoneyCapability = {
    asset: NationalCurrency;
    transferMethod: MobileMoneyCapability.transferMethod;
};

export namespace MobileMoneyCapability {

    export enum transferMethod {
        MOMO = 'Momo',
    }


}

