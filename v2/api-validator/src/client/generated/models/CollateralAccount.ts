/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AccountEnvironment } from './AccountEnvironment';
import type { CollateralId } from './CollateralId';
import type { CollateralSignerId } from './CollateralSignerId';

export type CollateralAccount = {
    collateralId: CollateralId;
    collateralSigners: Array<CollateralSignerId>;
    env: AccountEnvironment;
};
