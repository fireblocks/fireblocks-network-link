/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FiatCapability } from './FiatCapability';
import type { PublicBlockchainCapability } from './PublicBlockchainCapability';

export type OffRampCapability = {
    from: PublicBlockchainCapability;
    to: FiatCapability;
};
