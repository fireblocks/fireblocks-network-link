/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NationalCurrency } from './NationalCurrency';

export type SwiftCapability = {
    asset: NationalCurrency;
    transferMethod: SwiftCapability.transferMethod;
};

export namespace SwiftCapability {

    export enum transferMethod {
        SWIFT = 'Swift',
    }


}

