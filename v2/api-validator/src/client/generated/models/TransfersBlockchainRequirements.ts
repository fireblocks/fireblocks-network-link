/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CommonCapabilityRequirements } from './CommonCapabilityRequirements';
import type { WithdrawalAddressPolicyRequirement } from './WithdrawalAddressPolicyRequirement';

export type TransfersBlockchainRequirements = (CommonCapabilityRequirements & {
    withdrawalAddressPolicy?: WithdrawalAddressPolicyRequirement;
});

