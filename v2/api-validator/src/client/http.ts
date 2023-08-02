import axios, { AxiosRequestConfig } from 'axios';

export class Http {
  private readonly axiosConfig: AxiosRequestConfig;

  constructor(baseURL: string) {
    this.axiosConfig = {
      baseURL: normalizeBaseUrl(baseURL),
      headers: undefined,
    };
  }

  private makeConfig(
    headers?: Record<string, string>,
    params?: URLSearchParams
  ): AxiosRequestConfig {
    const config = { ...this.axiosConfig };
    if (params) {
      config.params = params;
    }
    if (headers) {
      config.headers = { ...config.headers, ...headers };
    }
    return config;
  }

  public async get<T>(
    url: string,
    params?: URLSearchParams,
    headers?: Record<string, string>
  ): Promise<T> {
    const r = await axios.get<T>(url, this.makeConfig(headers, params));
    return r.data;
  }

  public async post<T>(url: string, data: unknown, headers?: Record<string, string>): Promise<T> {
    const r = await axios.post<T>(url, data, this.makeConfig(headers));
    return r.data;
  }

  public async put<T>(url: string, data: unknown, headers?: Record<string, string>): Promise<T> {
    const r = await axios.put<T>(url, data, this.makeConfig(headers));
    return r.data;
  }

  public async delete<T>(url: string, headers?: Record<string, string>): Promise<T> {
    const r = await axios.delete<T>(url, this.makeConfig(headers));
    return r.data;
  }
}

function normalizeBaseUrl(baseUrl: string): string {
  if (!baseUrl.endsWith('/')) {
    return baseUrl + '/';
  }
  return baseUrl;
}
