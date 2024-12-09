/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CollateralAccount } from './CollateralAccount';
import type { CollateralAsset } from './CollateralAsset';
import type { CollateralLinkStatus } from './CollateralLinkStatus';

export type CollateralAccountLink = (CollateralAccount & {
    id: string;
    status: CollateralLinkStatus;
    eligibleCollateralAssets: Array<CollateralAsset>;
    rejectionReason?: string;
});

