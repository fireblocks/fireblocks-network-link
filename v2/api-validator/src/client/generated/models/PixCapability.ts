/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NationalCurrency } from './NationalCurrency';

export type PixCapability = {
    asset: NationalCurrency;
    transferMethod: PixCapability.transferMethod;
};

export namespace PixCapability {

    export enum transferMethod {
        PIX = 'Pix',
    }


}

