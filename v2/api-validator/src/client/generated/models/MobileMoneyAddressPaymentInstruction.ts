/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MobileMoneyAddressBase } from './MobileMoneyAddressBase';
import type { MobileMoneyAddressBeneficiaryInfo } from './MobileMoneyAddressBeneficiaryInfo';
import type { PaymentRedirect } from './PaymentRedirect';

export type MobileMoneyAddressPaymentInstruction = (MobileMoneyAddressBase & MobileMoneyAddressBeneficiaryInfo & {
    successPaymentInstructionRedirectUrl?: string;
    paymentRedirect?: PaymentRedirect;
});

