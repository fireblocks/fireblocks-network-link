/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FiatCapability } from './FiatCapability';
import type { PrefundedBlockchainCapability } from './PrefundedBlockchainCapability';

export type PrefundedOffRampCapability = {
    from: PrefundedBlockchainCapability;
    to: FiatCapability;
};

