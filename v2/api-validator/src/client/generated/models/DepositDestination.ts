/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AchAddress } from './AchAddress';
import type { IbanAddress } from './IbanAddress';
import type { InternalTransferAddress } from './InternalTransferAddress';
import type { PeerAccountTransferAddress } from './PeerAccountTransferAddress';
import type { PublicBlockchainAddress } from './PublicBlockchainAddress';
import type { SpeiAddress } from './SpeiAddress';
import type { SwiftAddress } from './SwiftAddress';
import type { WireAddress } from './WireAddress';

export type DepositDestination = (PublicBlockchainAddress | IbanAddress | SwiftAddress | AchAddress | WireAddress | SpeiAddress | PeerAccountTransferAddress | InternalTransferAddress);

