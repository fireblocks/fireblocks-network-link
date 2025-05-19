/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AchTransfer } from './AchTransfer';
import type { IbanTransfer } from './IbanTransfer';
import type { OtherFiatTransfer } from './OtherFiatTransfer';
import type { SpeiTransfer } from './SpeiTransfer';
import type { SwiftTransfer } from './SwiftTransfer';
import type { WireTransfer } from './WireTransfer';

export type FiatTransfer = (IbanTransfer | SwiftTransfer | AchTransfer | WireTransfer | SpeiTransfer | OtherFiatTransfer);

