/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AbaAddress } from './AbaAddress';
import type { AchAddress } from './AchAddress';
import type { ClabeAddress } from './ClabeAddress';
import type { EuropeanSEPAAddress } from './EuropeanSEPAAddress';
import type { IbanAddress } from './IbanAddress';
import type { LocalBankTransferAddress } from './LocalBankTransferAddress';
import type { MobileMoneyAddress } from './MobileMoneyAddress';
import type { PixAddress } from './PixAddress';
import type { SpeiAddress } from './SpeiAddress';
import type { SwiftAddress } from './SwiftAddress';
import type { WireAddress } from './WireAddress';

export type FiatAddress = (IbanAddress | SwiftAddress | AchAddress | WireAddress | SpeiAddress | PixAddress | EuropeanSEPAAddress | LocalBankTransferAddress | MobileMoneyAddress | AbaAddress | ClabeAddress);

