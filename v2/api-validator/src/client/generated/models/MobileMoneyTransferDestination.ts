/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MobileMoneyAddressWithBeneficiaryInfo } from './MobileMoneyAddressWithBeneficiaryInfo';
import type { PositiveAmount } from './PositiveAmount';

export type MobileMoneyTransferDestination = (MobileMoneyAddressWithBeneficiaryInfo & {
    amount: PositiveAmount;
});

