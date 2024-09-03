/**
 * Retrieves the value of a nested property in an object, given a string path.
 *
 * @param { Object } obj - The object from which to retrieve the property.
 * @param { string } path - The dot-separated path to the property in the object.
 * @returns { any } The value of the property, or null if the path is invalid.
 *
 * @example
 * getNestedProperty({ a: { b: 2 } }, 'a.b'); // will returns 2
 * getNestedProperty({ a: { b: { c: 3 } } }, 'a.b.c'); // will returns 3
 *
 */
export function getNestedProperty(obj: any, path: string) {
  return path.split('.').reduce((prev, curr) => {
    return prev ? prev[curr] : null;
  }, obj);
}
