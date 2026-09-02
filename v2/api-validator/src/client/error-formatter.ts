import { AxiosError } from 'axios';
import { ApiError } from './generated/core/ApiError';

// ANSI color codes
const cyan = '\x1b[36m';
const yellow = '\x1b[33m';
const reset = '\x1b[0m';

/**
 * Helper function to stringify and indent objects or primitive values
 */
function formatAndIndent(value: any, indentation: string): string {
  let text: string;
  try {
    if (typeof value === 'object' && value !== null) {
      text = JSON.stringify(value, null, 2);
    } else {
      text = String(value);
    }
  } catch (e) {
    text = String(value);
  }

  if (text === 'undefined') {
    return '<empty>';
  }

  return text
    .split('\n')
    .map((line, idx) => (idx === 0 ? line : indentation + line))
    .join('\n');
}

export function formatAxiosError(error: AxiosError): string {
  if (!error?.response?.status) {
    let message = `AxiosError: ${error.message}`;

    const url = error?.config?.url;
    if (url) {
      message += `\n  ${cyan}${error?.config?.method?.toUpperCase()} ${url}${reset}`;
    }

    return message;
  }

  const normalizedError: ApiError = {
    name: 'AxiosError',
    message: `AxiosError: ${error.message}`,
    url: error?.config?.url || '',
    status: error?.response?.status || 0,
    statusText: error?.response?.statusText || 'NOT HTTP ERROR',
    body: error?.response?.data,
    request: {
      method: (error?.config?.method || 'GET').toUpperCase() as any,
      url: error?.config?.url || '',
      body: error?.config?.data,
      query: error?.config?.params,
      headers: error?.config?.headers,
    },
  };
  return formatApiError(normalizedError);
}

/**
 * Format ApiError details for display
 */
export function formatApiError(error: ApiError): string {
  const indent = '  ';
  const innerIndent = '    ';

  const bodyStr = formatAndIndent(error.body, innerIndent);
  const requestBody = formatAndIndent(error.request.body, innerIndent);

  return (
    `${error.message}\n` +
    `${indent}${cyan}${error.request.method} ${error.url}${reset}\n` +
    `${indent}${yellow}Status:${reset} ${error.status} (${error.statusText})\n` +
    `${indent}${yellow}Response Body:${reset}\n${innerIndent}${bodyStr}\n` +
    `${indent}${yellow}Request Body:${reset}\n${innerIndent}${requestBody}\n`
  );
}
