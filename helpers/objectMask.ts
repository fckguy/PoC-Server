/**
 * @description A function that takes an object and a mask and returns a new object with asterisks in place of the masked values
 */
export const objectMask = (
  obj: Record<string, string | number | object> | object,
  mask: string[],
): { [key: string]: string } | object => {
  if (!obj) return obj;

  return Object.keys(obj).reduce((item, key) => {
    let value = obj?.[key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      value = objectMask(value, mask);
    }
    return {
      ...item,
      [key]: mask.includes(key)
        ? `${value.slice(0, Math.ceil(value?.length / 4) <= 4 ? Math.ceil(value?.length / 4) - 1 : 4)}${'*'.repeat(
            value?.length < 20 ? Math.ceil(value?.length / 4) : 20,
          )}`
        : value,
    };
  }, {});
};
