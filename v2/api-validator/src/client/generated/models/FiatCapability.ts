/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AbaCapability } from './AbaCapability';
import type { AchCapability } from './AchCapability';
import type { EuropeanSEPACapability } from './EuropeanSEPACapability';
import type { IbanCapability } from './IbanCapability';
import type { LocalBankTransferCapability } from './LocalBankTransferCapability';
import type { MobileMoneyCapability } from './MobileMoneyCapability';
import type { PixCapability } from './PixCapability';
import type { SpeiCapability } from './SpeiCapability';
import type { SwiftCapability } from './SwiftCapability';
import type { WireCapability } from './WireCapability';

export type FiatCapability = (IbanCapability | SwiftCapability | AchCapability | WireCapability | SpeiCapability | PixCapability | EuropeanSEPACapability | LocalBankTransferCapability | MobileMoneyCapability | AbaCapability);

