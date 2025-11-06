/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AchAddress } from './AchAddress';
import type { EuropeanSEPAAddress } from './EuropeanSEPAAddress';
import type { IbanAddress } from './IbanAddress';
import type { LocalBankTransferAddress } from './LocalBankTransferAddress';
import type { MobileMoneyAddress } from './MobileMoneyAddress';
import type { PixAddress } from './PixAddress';
import type { SpeiAddress } from './SpeiAddress';
import type { WireAddress } from './WireAddress';

export type FiatAddress = (IbanAddress | AchAddress | WireAddress | SpeiAddress | PixAddress | EuropeanSEPAAddress | LocalBankTransferAddress | MobileMoneyAddress);

