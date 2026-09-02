/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CommonCapabilityRequirements } from './CommonCapabilityRequirements';
import type { TransfersBlockchainRequirements } from './TransfersBlockchainRequirements';

export type CapabilitiesWithRequirements = {
    accounts?: CommonCapabilityRequirements;
    balances?: CommonCapabilityRequirements;
    transfers?: CommonCapabilityRequirements;
    transfersBlockchain?: TransfersBlockchainRequirements;
    transfersFiat?: CommonCapabilityRequirements;
    transfersPeerAccounts?: CommonCapabilityRequirements;
    transfersInternal?: CommonCapabilityRequirements;
    liquidity?: CommonCapabilityRequirements;
    ramps?: CommonCapabilityRequirements;
    rates?: CommonCapabilityRequirements;
};

