/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AccountHolderDetails } from './AccountHolderDetails';
import type { BankAccountNumber } from './BankAccountNumber';
import type { LocalBankTransferCapability } from './LocalBankTransferCapability';
import type { PaymentRedirect } from './PaymentRedirect';

export type LocalBankTransferAddressPaymentInstruction = (LocalBankTransferCapability & {
    accountHolder: AccountHolderDetails;
    accountNumber: BankAccountNumber;
    /**
     * Name of the bank
     */
    bankName: string;
    /**
     * Internal bank identifier
     */
    bankCode: string;
    successPaymentInstructionRedirect?: string;
    paymentRedirect?: PaymentRedirect;
});

