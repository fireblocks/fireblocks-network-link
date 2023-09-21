import addFormats from 'ajv-formats';
import { HTTPMethods } from 'fastify';
import { ErrorObject } from 'ajv/lib/types';
import Ajv, { Schema, ValidateFunction } from 'ajv';
import { SchemaCompilationError, XComError } from '../error';
import { EndpointSchema, getAllEndpointSchemas } from '../schemas';

type ResponseSchemas = Record<string, Schema>;

// Maps urls to HTTP methods to schema validation function
type ValidatorsDirectory = Map<string, Map<string, ValidateFunction>>;

type ValidationResult = {
  success: boolean;
  error?: ErrorObject;
};

/**
 * Pre-compiles all the response schemas and uses them to validate response
 * payloads.
 */
export class ResponseSchemaValidator {
  // Precompiled schema validators
  private readonly validatorsDirectory: ValidatorsDirectory;

  constructor() {
    this.validatorsDirectory = compileResponseSchemas(getAllEndpointSchemas());
  }

  /**
   * Validates that the response adheres to the schema defined for the
   * specified endpoint.
   *
   * @param method - HTTP method
   * @param openApiUrl - Relative path, as appears in the OpenAPI spec.
   * @param response - Response object to be validated.
   */
  public async validate(
    method: HTTPMethods,
    openApiUrl: string,
    response: any
  ): Promise<ValidationResult> {
    // The parsed schemas use Fastify parameters notation: `:param`
    // While the client specifies URLs in OpenAPI notation: `{param}`
    const url = openApiUrlToFastifyUrl(openApiUrl);

    const validator = this.validatorsDirectory.get(url)?.get(method);
    if (!validator) {
      throw new SchemaValidationError('Missing validator', method, url);
    }

    const success = validator(response);
    return {
      success,
      error: success ? undefined : validator.errors?.[0],
    };
  }
}

function compileResponseSchemas(schemas: EndpointSchema[]): ValidatorsDirectory {
  const ajv = new Ajv({ strictSchema: false });
  addFormats(ajv);

  // Maps urls to HTTP methods to schema validation function
  const allValidators = new Map<string, Map<string, ValidateFunction>>();

  for (const { method, url, schema } of schemas) {
    if (!allValidators.has(url)) {
      allValidators.set(url, new Map<string, ValidateFunction>());
    }
    const urlValidators = allValidators.get(url);
    if (!urlValidators) throw new Error('Undefined validator?! It should not ever happen');

    const responseSchemas = schema.response as ResponseSchemas;
    const responseSchema = responseSchemas['200'] ?? responseSchemas['201'] ?? {};

    try {
      urlValidators.set(method, ajv.compile(responseSchema));
    } catch (err: any) {
      throw new SchemaCompilationError(err.toString(), method, url);
    }
  }

  return allValidators;
}

function openApiUrlToFastifyUrl(url: string): string {
  return url.replace(/{(\w+)}/g, ':$1');
}

export class SchemaValidationError extends XComError {
  constructor(message: string, method: string, url: string) {
    super(message, { method, url });
  }
}
