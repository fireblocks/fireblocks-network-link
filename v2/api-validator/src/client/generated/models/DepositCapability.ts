/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AssetReference } from './AssetReference';
import type { DepositAddressCreationPolicy } from './DepositAddressCreationPolicy';
import type { IbanCapability } from './IbanCapability';
import type { PublicBlockchainCapability } from './PublicBlockchainCapability';
import type { SwiftCapability } from './SwiftCapability';

/**
 * Capability to deposit to a balance asset using a specific transfer capability. `addressCreationPolicy` determines whether new deposit addresses could be requested for this deposit capability.
 */
export type DepositCapability = {
    id: string;
    deposit: (PublicBlockchainCapability | IbanCapability | SwiftCapability);
    balanceAsset: AssetReference;
    addressCreationPolicy: DepositAddressCreationPolicy;
};

