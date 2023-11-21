/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { AxiosHttpRequest } from './core/AxiosHttpRequest';

import { AccountsService } from './services/AccountsService';
import { BalancesService } from './services/BalancesService';
import { CapabilitiesService } from './services/CapabilitiesService';
import { HistoricBalancesService } from './services/HistoricBalancesService';
import { LiquidityService } from './services/LiquidityService';
import { TradingService } from './services/TradingService';
import { TransfersService } from './services/TransfersService';
import { TransfersBlockchainService } from './services/TransfersBlockchainService';
import { TransfersFiatService } from './services/TransfersFiatService';
import { TransfersPeerAccountsService } from './services/TransfersPeerAccountsService';

type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;

export class ApiClient {

    public readonly accounts: AccountsService;
    public readonly balances: BalancesService;
    public readonly capabilities: CapabilitiesService;
    public readonly historicBalances: HistoricBalancesService;
    public readonly liquidity: LiquidityService;
    public readonly trading: TradingService;
    public readonly transfers: TransfersService;
    public readonly transfersBlockchain: TransfersBlockchainService;
    public readonly transfersFiat: TransfersFiatService;
    public readonly transfersPeerAccounts: TransfersPeerAccountsService;

    public readonly request: BaseHttpRequest;

    constructor(config?: Partial<OpenAPIConfig>, HttpRequest: HttpRequestConstructor = AxiosHttpRequest) {
        this.request = new HttpRequest({
            BASE: config?.BASE ?? 'http://0.0.0.0:8000',
            VERSION: config?.VERSION ?? '0.3.1',
            WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,
            CREDENTIALS: config?.CREDENTIALS ?? 'include',
            TOKEN: config?.TOKEN,
            USERNAME: config?.USERNAME,
            PASSWORD: config?.PASSWORD,
            HEADERS: config?.HEADERS,
            ENCODE_PATH: config?.ENCODE_PATH,
        });

        this.accounts = new AccountsService(this.request);
        this.balances = new BalancesService(this.request);
        this.capabilities = new CapabilitiesService(this.request);
        this.historicBalances = new HistoricBalancesService(this.request);
        this.liquidity = new LiquidityService(this.request);
        this.trading = new TradingService(this.request);
        this.transfers = new TransfersService(this.request);
        this.transfersBlockchain = new TransfersBlockchainService(this.request);
        this.transfersFiat = new TransfersFiatService(this.request);
        this.transfersPeerAccounts = new TransfersPeerAccountsService(this.request);
    }
}

