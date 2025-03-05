/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BridgeProperties } from './BridgeProperties';
import type { CommonRampRequestProperties } from './CommonRampRequestProperties';
import type { OffRampProperties } from './OffRampProperties';
import type { OnRampProperties } from './OnRampProperties';

export type RampRequest = (CommonRampRequestProperties & (OnRampProperties | OffRampProperties | BridgeProperties));

