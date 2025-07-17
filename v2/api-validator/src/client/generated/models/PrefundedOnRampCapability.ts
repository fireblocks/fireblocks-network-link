/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PrefundedFiatCapability } from './PrefundedFiatCapability';
import type { PublicBlockchainCapability } from './PublicBlockchainCapability';

export type PrefundedOnRampCapability = {
    from: PrefundedFiatCapability;
    to: PublicBlockchainCapability;
};

