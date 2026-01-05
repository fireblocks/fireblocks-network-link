/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Should be returned only if there in no more specific object.
 */
export type GeneralError = {
    /**
     * Description of the error.
     */
    message: string;
    errorType: GeneralError.errorType;
};

export namespace GeneralError {

    export enum errorType {
        INTERNAL_ERROR = 'internal-error',
        NOT_FOUND = 'not-found',
    }


}
