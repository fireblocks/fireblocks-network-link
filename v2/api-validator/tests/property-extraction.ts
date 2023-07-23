import { JsonValue } from 'type-fest';

export function isObject(x: any): boolean {
  return x && typeof x === 'object' && !Array.isArray(x);
}

export function getPropertyPaths(obj?: JsonValue): Array<Array<string>> {
  if (!isObject(obj) || typeof obj === 'string') {
    return [];
  }

  const getAllPropPaths = (obj, head: string[] = []) => {
    const paths: Array<Array<string>> = [];

    for (const [key, value] of Object.entries(obj)) {
      const path = [...head, key];
      paths.push(path);

      if (isObject(value)) {
        paths.push(...getAllPropPaths(value, path));
      }
    }

    return paths;
  };

  return getAllPropPaths(obj);
}

export function deleteDeepProperty(obj: object, propertyPath: string[]): void {
  // Don't modify the original list
  const properties = [...propertyPath];

  const lastProp = properties.pop();
  if (!lastProp) return;

  let targetObj = obj;
  for (const prop of properties) {
    targetObj = targetObj[prop];
  }

  delete targetObj[lastProp];
}
