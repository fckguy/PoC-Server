import { objectMask } from '../objectMask';

const objectA = {
  a: 'a',
  b: 'b',
};

describe('objectMask', () => {
  test('should match the stringify object', () => {
    const objectAMasked = {
      ...objectA,
      a: '*',
    };
    expect(objectMask(objectA, ['a'])).toEqual(objectAMasked);
  });
});
