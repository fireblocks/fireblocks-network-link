/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CollateralId } from './CollateralId';
import type { CollateralSignerId } from './CollateralSignerId';
import type { Environment } from './Environment';

export type CollateralAccount = {
    id: string;
    collateralId: CollateralId;
    collateralSigners: Array<CollateralSignerId>;
    env: Environment;
};

