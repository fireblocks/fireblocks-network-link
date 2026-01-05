/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FiatAddress } from './FiatAddress';
import type { OnRampProperties } from './OnRampProperties';

export type OnRampPropertiesWithPaymentInstructions = ({
paymentInstructions: (FiatAddress & {
referenceId?: string;
});
} & OnRampProperties);
