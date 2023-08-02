import { deleteDeepProperty, getPropertyPaths } from '../property-extraction';

describe('getPropertyPaths', () => {
  it('should work for empty objects', () => {
    const result = getPropertyPaths({});
    expect(result).toEqual([]);
  });

  it('should work for undefined objects', () => {
    const result = getPropertyPaths(undefined);
    expect(result).toEqual([]);
  });

  it('should work for null objects', () => {
    const result = getPropertyPaths(null);
    expect(result).toEqual([]);
  });

  it('should work for objects with one simple property', () => {
    const result = getPropertyPaths({ a: 100 });
    expect(result).toEqual([['a']]);
  });

  it('should work for objects with nested properties', () => {
    const result = getPropertyPaths({
      a: 100,
      b: {
        c: 'c',
        d: {
          e: 200,
          f: 300,
        },
      },
      g: 'g',
    });
    expect(result).toEqual([
      ['a'],
      ['b'],
      ['b', 'c'],
      ['b', 'd'],
      ['b', 'd', 'e'],
      ['b', 'd', 'f'],
      ['g'],
    ]);
  });
});

describe('deleteDeepProperty', () => {
  let obj: object;

  beforeEach(() => {
    obj = { a: 1, b: { c: { d: 2 } } };
  });

  it('should do nothing if path is empty', () => {
    deleteDeepProperty(obj, []);
    expect(obj).toEqual({ a: 1, b: { c: { d: 2 } } });
  });
  it('should be able to remove top level non-object property', () => {
    deleteDeepProperty(obj, ['a']);
    expect(obj).toEqual({ b: { c: { d: 2 } } });
  });
  it('should be able to remove top level object property', () => {
    deleteDeepProperty(obj, ['b']);
    expect(obj).toEqual({ a: 1 });
  });
  it('should be able to remove property of property', () => {
    deleteDeepProperty(obj, ['b', 'c']);
    expect(obj).toEqual({ a: 1, b: {} });
  });
  it('should be able to remove property of property of property', () => {
    deleteDeepProperty(obj, ['b', 'c', 'd']);
    expect(obj).toEqual({ a: 1, b: { c: {} } });
  });
});
