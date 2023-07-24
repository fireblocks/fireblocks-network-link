import { JsonObject } from 'type-fest';
import { JSONSchemaFaker } from 'json-schema-faker';

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
