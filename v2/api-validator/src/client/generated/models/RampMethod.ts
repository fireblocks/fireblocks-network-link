/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BridgeCapability } from './BridgeCapability';
import type { OffRampCapability } from './OffRampCapability';
import type { OnRampCapability } from './OnRampCapability';

export type RampMethod = ({
    id: string;
} & (OnRampCapability | OffRampCapability | BridgeCapability));

