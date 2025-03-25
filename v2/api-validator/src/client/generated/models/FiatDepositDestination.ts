/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { IbanAddress } from './IbanAddress';
import type { SwiftAddress } from './SwiftAddress';

export type FiatDepositDestination = ({
    referenceId?: string;
} & (IbanAddress | SwiftAddress));

