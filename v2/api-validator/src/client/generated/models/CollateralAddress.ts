/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PublicBlockchainAddress } from './PublicBlockchainAddress';

export type CollateralAddress = {
    address: PublicBlockchainAddress;
    /**
     * An account ID used when recovering the assets of an off-exchange client
     */
    recoveryAccountId: string;
};

