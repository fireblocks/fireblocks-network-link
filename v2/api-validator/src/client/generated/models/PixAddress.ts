/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AccountHolderDetails } from './AccountHolderDetails';
import type { Pix } from './Pix';
import type { PixCapability } from './PixCapability';

export type PixAddress = (PixCapability & {
    accountHolder: AccountHolderDetails;
    pix: Pix;
});

