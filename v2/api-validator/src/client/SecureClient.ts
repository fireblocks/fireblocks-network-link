import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, Method } from 'axios';
import config from '../config';
import logger from '../logging';
import { randomUUID } from 'crypto';
import { ResponseSchemaValidationFailed, XComError } from '../error';
import { buildRequestSignature } from '../security';
import { ResponseSchemaValidator } from './response-schema-validator';
import { request as requestInternal } from './generated/core/request';
import { ApiRequestOptions } from './generated/core/ApiRequestOptions';
import { ApiError } from './generated/core/ApiError';
import { getRelativeUrlWithoutPathPrefix } from '../url-helpers';
import { formatApiError, formatAxiosError } from './error-formatter';
import {
  Account,
  AccountsService,
  ApiComponents,
  BalancesService,
  BaseHttpRequest,
  CancelablePromise,
  CapabilitiesService,
  CollateralService,
  LiquidityService,
  OpenAPI,
  OpenAPIConfig,
  RampsService,
  RatesService,
  TransfersBlockchainService,
  TransfersFiatService,
  TransfersInternalService,
  TransfersPeerAccountsService,
  TransfersService,
} from './generated';

const log = logger('api-client');

export type SecurityHeaders = {
  xFbapiKey: string;
  xFbapiNonce: string;
  xFbapiTimestamp: number;
  xFbapiSignature: string;
  xFbPlatformSignature: string;
};

type Func = (arg) => any;
type FirstFuncParam<F extends Func> = Parameters<F>[0];

type FirstFuncParamWithoutSecurityHeaders<M extends Func> = Omit<
  FirstFuncParam<M>,
  keyof SecurityHeaders
>;

type WithoutSecurityHeaders<F extends Func> = (
  args: FirstFuncParamWithoutSecurityHeaders<F>
) => ReturnType<F>;

// This type is designed to take one of the generated service types
// and for its each method, remove the security header parameters
type SecureService<Service> = {
  [k in keyof Service]: Service[k] extends Func ? WithoutSecurityHeaders<Service[k]> : never;
};

/**
 * Creates a new object with the same methods as in {@link service} but
 * with the security header parameters stripped. The security parameters
 * are supplied later by {@link HttpRequestWithSecurityHeaders}.
 */
function stripSecurityHeaderArgs<ServiceType extends object>(
  service: ServiceType
): SecureService<ServiceType> {
  const emptySecurityHeaders = {
    xFbapiKey: '',
    xFbapiNonce: '',
    xFbapiTimestamp: 0,
    xFbapiSignature: '',
    xFbPlatformSignature: '',
  };

  const securedService = {};

  const propNames = Object.getOwnPropertyNames(Object.getPrototypeOf(service));
  for (const propName of propNames) {
    const prop = service[propName];

    if (prop instanceof Function) {
      const originalMethod = prop.bind(service);

      // Wrapped original method with improved error reporting
      securedService[propName] = async (args) => {
        try {
          return await originalMethod({ ...args, ...emptySecurityHeaders });
        } catch (error) {
          if (error instanceof ApiError) {
            error.message = formatApiError(error);
          } else if (error instanceof AxiosError) {
            throw new Error(formatAxiosError(error));
          }
          throw error;
        }
      };
    }
  }

  return securedService as SecureService<ServiceType>;
}

type SecurityHeadersFactory = (options: AxiosRequestConfig) => SecurityHeaders;

export class SecureClient {
  public readonly accounts: SecureService<AccountsService>;
  public readonly balances: SecureService<BalancesService>;
  public readonly capabilities: SecureService<CapabilitiesService>;
  public readonly liquidity: SecureService<LiquidityService>;
  public readonly transfers: SecureService<TransfersService>;
  public readonly transfersBlockchain: SecureService<TransfersBlockchainService>;
  public readonly transfersFiat: SecureService<TransfersFiatService>;
  public readonly transfersPeerAccounts: SecureService<TransfersPeerAccountsService>;
  public readonly transfersInternal: SecureService<TransfersInternalService>;
  public readonly collateral: SecureService<CollateralService>;
  public readonly ramps: SecureService<RampsService>;
  public readonly rates: SecureService<RatesService>;
  private readonly request: BaseHttpRequest;

  private static cachedApiComponents?: ApiComponents;
  private static cachedAccounts?: Array<Account>;

  constructor(securityHeadersFactory: SecurityHeadersFactory = createSecurityHeaders) {
    this.request = new HttpRequestWithSecurityHeaders(securityHeadersFactory, {
      ...OpenAPI,
      BASE: config.get('client').serverBaseUrl,
    });

    this.rates = stripSecurityHeaderArgs(new RatesService(this.request));
    this.accounts = stripSecurityHeaderArgs(new AccountsService(this.request));
    this.balances = stripSecurityHeaderArgs(new BalancesService(this.request));
    this.capabilities = stripSecurityHeaderArgs(new CapabilitiesService(this.request));
    this.liquidity = stripSecurityHeaderArgs(new LiquidityService(this.request));
    this.transfers = stripSecurityHeaderArgs(new TransfersService(this.request));
    this.collateral = stripSecurityHeaderArgs(new CollateralService(this.request));
    this.transfersBlockchain = stripSecurityHeaderArgs(
      new TransfersBlockchainService(this.request)
    );
    this.transfersFiat = stripSecurityHeaderArgs(new TransfersFiatService(this.request));
    this.transfersPeerAccounts = stripSecurityHeaderArgs(
      new TransfersPeerAccountsService(this.request)
    );
    this.transfersInternal = stripSecurityHeaderArgs(new TransfersInternalService(this.request));
    this.ramps = stripSecurityHeaderArgs(new RampsService(this.request));
  }

  public async cacheCapabilities(): Promise<void> {
    SecureClient.cachedApiComponents = (await this.capabilities.getCapabilities({})).components;
    SecureClient.cachedAccounts = (await this.accounts.getAccounts({ limit: 200 })).accounts;
  }

  public static getCachedApiComponents(): ApiComponents {
    if (!SecureClient.cachedApiComponents) {
      throw new XComError('Cached capabilities not initialized');
    }
    return SecureClient.cachedApiComponents;
  }

  public static getCachedAccounts(): Array<Account> {
    if (!SecureClient.cachedAccounts) {
      throw new XComError('Cached capabilities not initialized');
    }
    return SecureClient.cachedAccounts;
  }
}

export class HttpRequestWithSecurityHeaders extends BaseHttpRequest {
  private readonly axiosClient: AxiosInstance;
  private readonly responseValidator = new ResponseSchemaValidator();

  constructor(
    private readonly securityHeadersFactory: SecurityHeadersFactory,
    openAPIConfig: OpenAPIConfig
  ) {
    super(openAPIConfig);

    this.axiosClient = axios.create({
      timeout: 30000,
    });

    this.axiosClient.interceptors.request.use((request) => {
      log.debug('Sending HTTP request', { request });
      return request;
    });

    this.axiosClient.interceptors.response.use(
      (response) => {
        const { config, status, statusText, data } = response;
        log.debug('Received HTTP response', { config, status, statusText, data });
        return response;
      },
      (error) => {
        log.debug('Received HTTP error', { error });
        return Promise.reject(error);
      }
    );

    const originalRequestMethod = this.axiosClient.request.bind(this.axiosClient);

    this.axiosClient.request = <T = any, R = AxiosResponse<T>, D = any>(
      axiosRequestConfig: AxiosRequestConfig<D>
    ): Promise<R> => {
      const headers = this.securityHeadersFactory(axiosRequestConfig);
      return originalRequestMethod({
        ...axiosRequestConfig,
        headers: {
          ...axiosRequestConfig.headers,
          'X-FBAPI-KEY': headers.xFbapiKey,
          'X-FBAPI-NONCE': headers.xFbapiNonce,
          'X-FBAPI-TIMESTAMP': headers.xFbapiTimestamp,
          'X-FBAPI-SIGNATURE': headers.xFbapiSignature,
        },
      });
    };
  }

  private async requestWithValidation<T>(options: ApiRequestOptions): Promise<T> {
    const response = await requestInternal<T>(this.config, options, this.axiosClient);

    const validationResult = await this.responseValidator.validate(
      options.method,
      options.url,
      response
    );
    if (!validationResult.success) {
      throw new ResponseSchemaValidationFailed(
        options.method,
        options.url,
        response,
        validationResult.error
      );
    }

    return response;
  }

  public override request<T>(options: ApiRequestOptions): CancelablePromise<T> {
    return this.requestWithValidation<T>(options) as CancelablePromise<T>;
  }
}

export function createSecurityHeaders(
  options: AxiosRequestConfig,
  overrideOptions?: { nonce?: string; timestamp?: number }
): SecurityHeaders {
  const apiKey = config.get('authentication').apiKey;
  const nonce = overrideOptions?.nonce === undefined ? randomUUID() : overrideOptions.nonce;
  const timestamp =
    overrideOptions?.timestamp === undefined ? Date.now() : overrideOptions.timestamp;

  const relativeUrl = getRelativeUrlWithoutPathPrefix(options.url as string);
  const payload = buildSignaturePayload(
    options.method as Method,
    relativeUrl,
    options.data,
    timestamp,
    nonce
  );
  const signature = buildRequestSignature(payload);

  return {
    xFbapiKey: apiKey,
    xFbapiSignature: signature,
    xFbapiTimestamp: timestamp,
    xFbapiNonce: nonce,
    xFbPlatformSignature: signature,
  };
}

/**
 * Builds the payload to sign from the request components
 */
function buildSignaturePayload(
  method: Method,
  endpoint: string,
  body: object,
  timestamp: number,
  nonce: string
): string {
  return `${timestamp}${nonce}${method.toUpperCase()}${endpoint}${stringifyBody(body)}`;
}

function stringifyBody(body): string {
  if (!body) {
    return '';
  }
  return JSON.stringify(body);
}
