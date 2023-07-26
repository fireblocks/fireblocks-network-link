import { JsonObject } from 'type-fest';
import { JSONSchemaFaker } from 'json-schema-faker';

/**
 * Create an object with its structure described by {@link schema} and
 * populate all the properties with random values.
 */
export function fakeObject(schema: unknown | undefined): JsonObject | undefined {
  if (!schema) {
    return undefined;
  }

  const value = JSONSchemaFaker.generate(schema);
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  return value;
}
