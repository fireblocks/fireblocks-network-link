import config from '../config';
import { HTTPMethods } from 'fastify';
import { ErrorObject } from 'ajv/lib/types';
import Ajv, { Schema, ValidateFunction } from 'ajv';
import { OpenApiOperationDetails, parseOpenApiYaml } from '../server/schema';
import { XComError } from '../error';

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
  private readonly openApiCompiled: Promise<void>;

  // Precompiled schema validators
  private validatorsDirectory: ValidatorsDirectory = new Map();

  constructor() {
    const openApiYamlPathname = config.getUnifiedOpenApiPathname();

    this.openApiCompiled = parseOpenApiYaml(openApiYamlPathname).then((schemas) => {
      this.validatorsDirectory = compileResponseSchemas(schemas);
    });
  }

  /**
   * Validates that the response adheres to the schema defined for the
   * specified endpoint.
   *
   * @param method - HTTP method
   * @param url - Relative path, as appears in the OpenAPI spec.
   * @param response - Response object to be validated.
   */
  public async validate(
    method: HTTPMethods,
    url: string,
    response: any
  ): Promise<ValidationResult> {
    await this.openApiCompiled;

    if (!this.validatorsDirectory) {
      throw new Error('Validators were not initialized properly');
    }

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

function compileResponseSchemas(schemas: OpenApiOperationDetails[]): ValidatorsDirectory {
  const ajv = new Ajv({ strictSchema: false });

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

export class SchemaCompilationError extends XComError {
  constructor(message: string, method: string, url: string) {
    super(message, { method, url });
  }
}

export class SchemaValidationError extends XComError {
  constructor(message: string, method: string, url: string) {
    super(message, { method, url });
  }
}
