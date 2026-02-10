/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ApiComponents } from './ApiComponents';
import type { CapabilitiesWithRequirements } from './CapabilitiesWithRequirements';

export type Capabilities = {
    /**
     * Version number of the API specification that this server implements
     */
    version: string;
    components: ApiComponents;
    requirements?: CapabilitiesWithRequirements;
};

