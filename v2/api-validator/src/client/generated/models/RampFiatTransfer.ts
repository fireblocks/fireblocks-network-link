/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AchTransfer } from './AchTransfer';
import type { EuropeanSEPATransfer } from './EuropeanSEPATransfer';
import type { IbanTransfer } from './IbanTransfer';
import type { LocalBankTransfer } from './LocalBankTransfer';
import type { MobileMoneyTransfer } from './MobileMoneyTransfer';
import type { PixTransfer } from './PixTransfer';
import type { SpeiTransfer } from './SpeiTransfer';
import type { WireTransfer } from './WireTransfer';

export type RampFiatTransfer = (IbanTransfer | AchTransfer | WireTransfer | SpeiTransfer | PixTransfer | EuropeanSEPATransfer | LocalBankTransfer | MobileMoneyTransfer);
