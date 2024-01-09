/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { IbanTransfer } from './IbanTransfer';
import type { InternalTransfer } from './InternalTransfer';
import type { OtherFiatTransfer } from './OtherFiatTransfer';
import type { PeerAccountTransfer } from './PeerAccountTransfer';
import type { PublicBlockchainTransaction } from './PublicBlockchainTransaction';
import type { SwiftTransfer } from './SwiftTransfer';

export type Transfer = (PeerAccountTransfer | InternalTransfer | PublicBlockchainTransaction | IbanTransfer | SwiftTransfer | OtherFiatTransfer);

