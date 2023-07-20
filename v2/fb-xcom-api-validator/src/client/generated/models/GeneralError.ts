/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ErrorType } from './ErrorType';

/**
 * Should be returned only if there in no more specific object.
 */
export type GeneralError = {
    /**
     * Description of the error.
     */
    message?: string;
    errorType?: ErrorType;
};

