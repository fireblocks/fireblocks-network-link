/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BridgeCapability } from './BridgeCapability';
import type { OffRampCapability } from './OffRampCapability';
import type { OnRampCapability } from './OnRampCapability';
import type { PrefundedBridgeCapability } from './PrefundedBridgeCapability';
import type { PrefundedOffRampCapability } from './PrefundedOffRampCapability';
import type { PrefundedOnRampCapability } from './PrefundedOnRampCapability';

export type RampMethod = ({
id: string;
} & (OnRampCapability | PrefundedOnRampCapability | OffRampCapability | PrefundedOffRampCapability | BridgeCapability | PrefundedBridgeCapability));
