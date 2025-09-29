/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AssetCommonProperties } from './AssetCommonProperties';
import type { AssetReference } from './AssetReference';

export type VirtualAsset = (AssetCommonProperties & {
    type?: VirtualAsset.type;
    peggedTo?: AssetReference;
});

export namespace VirtualAsset {

    export enum type {
        VIRTUAL_ASSET = 'VirtualAsset',
    }


}

