/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AchCapability } from './AchCapability';
import type { ChapsCapability } from './ChapsCapability';
import type { EuropeanSEPACapability } from './EuropeanSEPACapability';
import type { IbanCapability } from './IbanCapability';
import type { InteracCapability } from './InteracCapability';
import type { InternalTransferMethod } from './InternalTransferMethod';
import type { LocalBankTransferCapability } from './LocalBankTransferCapability';
import type { MobileMoneyCapability } from './MobileMoneyCapability';
import type { PayIdCapability } from './PayIdCapability';
import type { PixCapability } from './PixCapability';
import type { SpeiCapability } from './SpeiCapability';
import type { WireCapability } from './WireCapability';

export type FiatCapability = (IbanCapability | AchCapability | WireCapability | SpeiCapability | PixCapability | EuropeanSEPACapability | LocalBankTransferCapability | MobileMoneyCapability | PayIdCapability | InteracCapability | ChapsCapability | InternalTransferMethod);

