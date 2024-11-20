/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * - **Eligible** - The provider account is eligible for linking to a collateral account
 * - **Linked** - The provider account is linked to a collateral account
 * - **Disabled** - The link is disabled at the moment, but can be re-enabled
 * - **Failed** - The link creation failed
 *
 */
export enum CollateralLinkStatus {
    ELIGIBLE = 'Eligible',
    LINKED = 'Linked',
    DISABLED = 'Disabled',
    FAILED = 'Failed',
}
