/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AchCapability } from './AchCapability';
import type { IbanCapability } from './IbanCapability';
import type { SpeiCapability } from './SpeiCapability';
import type { SwiftCapability } from './SwiftCapability';
import type { WireCapability } from './WireCapability';

export type FiatCapability = (IbanCapability | SwiftCapability | AchCapability | WireCapability | SpeiCapability);

