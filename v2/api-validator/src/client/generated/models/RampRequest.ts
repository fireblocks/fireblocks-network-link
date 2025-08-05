/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BridgeProperties } from './BridgeProperties';
import type { CommonRampRequestProperties } from './CommonRampRequestProperties';
import type { OffRampProperties } from './OffRampProperties';
import type { OnRampProperties } from './OnRampProperties';
import type { OrderQuote } from './OrderQuote';
import type { ParticipantsIdentification } from './ParticipantsIdentification';
import type { PrefundedBridgeProperties } from './PrefundedBridgeProperties';
import type { PrefundedOffRampProperties } from './PrefundedOffRampProperties';
import type { PrefundedOnRampProperties } from './PrefundedOnRampProperties';

export type RampRequest = (CommonRampRequestProperties & (OnRampProperties | PrefundedOnRampProperties | OffRampProperties | PrefundedOffRampProperties | BridgeProperties | PrefundedBridgeProperties) & {
    executionDetails?: OrderQuote;
} & {
    participantsIdentification?: ParticipantsIdentification;
});

