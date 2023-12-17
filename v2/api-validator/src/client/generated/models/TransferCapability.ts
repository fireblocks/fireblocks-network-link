/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { IbanCapability } from './IbanCapability';
import type { InternalTransferCapability } from './InternalTransferCapability';
import type { PeerAccountTransferCapability } from './PeerAccountTransferCapability';
import type { PublicBlockchainCapability } from './PublicBlockchainCapability';
import type { SwiftCapability } from './SwiftCapability';

export type TransferCapability = (PeerAccountTransferCapability | InternalTransferCapability | PublicBlockchainCapability | IbanCapability | SwiftCapability);

