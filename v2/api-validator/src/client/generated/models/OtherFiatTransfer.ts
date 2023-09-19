/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NationalCurrency } from './NationalCurrency';
import type { PositiveAmount } from './PositiveAmount';

/**
 * Used for historic fiat transfers that do not fit a more specific transfer method.  It is impossible to create new deposits or withdrawal of this type using this API.
 */
export type OtherFiatTransfer = {
    transferMethod: OtherFiatTransfer.transferMethod;
    asset: NationalCurrency;
    amount: PositiveAmount;
    description: string;
    tag?: string;
    referenceId?: string;
};

export namespace OtherFiatTransfer {

    export enum transferMethod {
        OTHER_FIAT = 'OtherFiat',
    }


}

