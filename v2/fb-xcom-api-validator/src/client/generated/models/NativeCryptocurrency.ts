/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Blockchain } from './Blockchain';
import type { Layer1Cryptocurrency } from './Layer1Cryptocurrency';
import type { Layer2Cryptocurrency } from './Layer2Cryptocurrency';

export type NativeCryptocurrency = {
    blockchain?: Blockchain;
    cryptocurrencySymbol: (Layer1Cryptocurrency | Layer2Cryptocurrency);
    testAsset?: boolean;
};

