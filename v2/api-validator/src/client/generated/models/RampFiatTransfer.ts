/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AbaTransfer } from './AbaTransfer';
import type { AchTransfer } from './AchTransfer';
import type { ClabeTransfer } from './ClabeTransfer';
import type { EuropeanSEPATransfer } from './EuropeanSEPATransfer';
import type { IbanTransfer } from './IbanTransfer';
import type { LocalBankTransfer } from './LocalBankTransfer';
import type { MobileMoneyTransfer } from './MobileMoneyTransfer';
import type { PixTransfer } from './PixTransfer';
import type { SpeiTransfer } from './SpeiTransfer';
import type { SwiftTransfer } from './SwiftTransfer';
import type { WireTransfer } from './WireTransfer';

export type RampFiatTransfer = (IbanTransfer | SwiftTransfer | AchTransfer | WireTransfer | SpeiTransfer | PixTransfer | EuropeanSEPATransfer | LocalBankTransfer | MobileMoneyTransfer | AbaTransfer | ClabeTransfer);

