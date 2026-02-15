/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AchAddress } from './AchAddress';
import type { ChapsAddress } from './ChapsAddress';
import type { EuropeanSEPAAddress } from './EuropeanSEPAAddress';
import type { IbanAddress } from './IbanAddress';
import type { InteracAddress } from './InteracAddress';
import type { LocalBankTransferAddress } from './LocalBankTransferAddress';
import type { MobileMoneyAddressOffRamp } from './MobileMoneyAddressOffRamp';
import type { PayIdAddress } from './PayIdAddress';
import type { PixAddress } from './PixAddress';
import type { SpeiAddress } from './SpeiAddress';
import type { WireAddress } from './WireAddress';

export type FiatAddress = (IbanAddress | AchAddress | WireAddress | SpeiAddress | PixAddress | EuropeanSEPAAddress | LocalBankTransferAddress | MobileMoneyAddressOffRamp | PayIdAddress | InteracAddress | ChapsAddress);

