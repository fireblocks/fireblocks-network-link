/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AssetReference } from './AssetReference';
import type { FeeAmount } from './FeeAmount';

export type Fee = {
    /**
     * Specifies the category of fee applied to the transaction. - ORDER - Fee charged by the platform for executing the trade. - NETWORK - Blockchain network fee paid to validators/miners. - SPREAD - Implicit cost built into the price difference between quotes. - REBATE - Negative fee returned to the user as a reward or incentive.
     *
     */
    feeType: Fee.feeType;
    feeAsset: AssetReference;
    fee: FeeAmount;
};

export namespace Fee {

    /**
     * Specifies the category of fee applied to the transaction. - ORDER - Fee charged by the platform for executing the trade. - NETWORK - Blockchain network fee paid to validators/miners. - SPREAD - Implicit cost built into the price difference between quotes. - REBATE - Negative fee returned to the user as a reward or incentive.
     *
     */
    export enum feeType {
        ORDER = 'ORDER',
        NETWORK = 'NETWORK',
        SPREAD = 'SPREAD',
        REBATE = 'REBATE',
    }


}

