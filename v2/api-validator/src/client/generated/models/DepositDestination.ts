/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { IbanAddress } from './IbanAddress';
import type { InternalTransferAddress } from './InternalTransferAddress';
import type { PeerAccountTransferAddress } from './PeerAccountTransferAddress';
import type { PublicBlockchainAddress } from './PublicBlockchainAddress';
import type { SwiftAddress } from './SwiftAddress';

export type DepositDestination = (PublicBlockchainAddress | IbanAddress | SwiftAddress | PeerAccountTransferAddress | InternalTransferAddress);

