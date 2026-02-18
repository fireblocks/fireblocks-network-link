/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AchAddress } from './AchAddress';
import type { ChapsAddress } from './ChapsAddress';
import type { EuropeanSEPAAddress } from './EuropeanSEPAAddress';
import type { IbanAddress } from './IbanAddress';
import type { InteracAddressPaymentInstruction } from './InteracAddressPaymentInstruction';
import type { InternalTransferAddress } from './InternalTransferAddress';
import type { LocalBankTransferAddressPaymentInstruction } from './LocalBankTransferAddressPaymentInstruction';
import type { MobileMoneyAddressPaymentInstruction } from './MobileMoneyAddressPaymentInstruction';
import type { PayIdAddress } from './PayIdAddress';
import type { PixAddressPaymentInstruction } from './PixAddressPaymentInstruction';
import type { SpeiAddress } from './SpeiAddress';
import type { WireAddress } from './WireAddress';

/**
 * Fiat payment instruction for on-ramp
 */
export type FiatPaymentInstruction = (IbanAddress | AchAddress | WireAddress | SpeiAddress | PixAddressPaymentInstruction | ChapsAddress | EuropeanSEPAAddress | LocalBankTransferAddressPaymentInstruction | MobileMoneyAddressPaymentInstruction | PayIdAddress | InteracAddressPaymentInstruction | InternalTransferAddress);

