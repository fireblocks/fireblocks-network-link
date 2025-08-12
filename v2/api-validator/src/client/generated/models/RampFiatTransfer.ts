/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AchTransfer } from './AchTransfer';
import type { IbanTransfer } from './IbanTransfer';
import type { PixTransfer } from './PixTransfer';
import type { SepaTransfer } from './SepaTransfer';
import type { SpeiTransfer } from './SpeiTransfer';
import type { SwiftTransfer } from './SwiftTransfer';
import type { WireTransfer } from './WireTransfer';

export type RampFiatTransfer = (IbanTransfer | SwiftTransfer | AchTransfer | WireTransfer | SpeiTransfer | PixTransfer | SepaTransfer);

