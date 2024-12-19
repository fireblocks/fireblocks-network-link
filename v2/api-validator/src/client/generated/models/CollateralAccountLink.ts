/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CollateralAccount } from './CollateralAccount';
import type { CollateralLinkStatus } from './CollateralLinkStatus';
import type { CryptocurrencyReference } from './CryptocurrencyReference';

export type CollateralAccountLink = ({
    id: string;
    status: CollateralLinkStatus;
    eligibleCollateralAssets: Array<CryptocurrencyReference>;
    rejectionReason?: string;
} & CollateralAccount);

