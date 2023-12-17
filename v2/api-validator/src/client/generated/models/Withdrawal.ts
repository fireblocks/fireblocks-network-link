/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BlockchainWithdrawal } from './BlockchainWithdrawal';
import type { FiatWithdrawal } from './FiatWithdrawal';
import type { InternalWithdrawal } from './InternalWithdrawal';
import type { PeerAccountWithdrawal } from './PeerAccountWithdrawal';

export type Withdrawal = (PeerAccountWithdrawal | InternalWithdrawal | BlockchainWithdrawal | FiatWithdrawal);

