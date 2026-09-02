/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NationalCurrency } from './NationalCurrency';
import type { OtherAssetReference } from './OtherAssetReference';
import type { PeerAccountTransferDestination } from './PeerAccountTransferDestination';
import type { WithdrawalRequestCommonProperties } from './WithdrawalRequestCommonProperties';

export type PeerAccountWithdrawalRequest = (WithdrawalRequestCommonProperties & {
    /**
     * Balance asset for peer account withdrawals. Native cryptocurrencies are not supported; only fiat assets and other (e.g., tokenized) assets are allowed.
     *
     */
    balanceAsset: (NationalCurrency | OtherAssetReference);
    destination: PeerAccountTransferDestination;
});

