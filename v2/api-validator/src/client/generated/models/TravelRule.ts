/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Beneficiary } from './Beneficiary';
import type { Originator } from './Originator';

/**
 * Travel Rule compliance requires VASPs to share originator and beneficiary details for qualifying transactions.  The `travelRule` object ensures that either an `originator` or `beneficiary` is provided, facilitating secure and compliant data exchange.
 */
export type TravelRule = (Originator | Beneficiary);

