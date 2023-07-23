/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CrossAccountTransfer } from './CrossAccountTransfer';
import type { IbanTransfer } from './IbanTransfer';
import type { PublicBlockchainTransaction } from './PublicBlockchainTransaction';
import type { SwiftTransfer } from './SwiftTransfer';

export type Transfer = (CrossAccountTransfer | PublicBlockchainTransaction | IbanTransfer | SwiftTransfer);

