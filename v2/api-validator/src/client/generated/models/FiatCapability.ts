/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AchCapability } from './AchCapability';
import type { EuropeanSEPACapability } from './EuropeanSEPACapability';
import type { IbanCapability } from './IbanCapability';
import type { InteracTransferCapability } from './InteracTransferCapability';
import type { LocalBankTransferCapability } from './LocalBankTransferCapability';
import type { MobileMoneyCapability } from './MobileMoneyCapability';
import type { PayIdCapability } from './PayIdCapability';
import type { PixCapability } from './PixCapability';
import type { SpeiCapability } from './SpeiCapability';
import type { WireCapability } from './WireCapability';

export type FiatCapability = (IbanCapability | AchCapability | WireCapability | SpeiCapability | PixCapability | EuropeanSEPACapability | LocalBankTransferCapability | MobileMoneyCapability | PayIdCapability | InteracTransferCapability);

