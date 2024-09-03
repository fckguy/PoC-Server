import { orderObjectKeys } from '../orderObjectKeys';

const objectA = {
  a: 'a',
  b: 'b',
};
const objectB = {
  b: 'b',
  a: 'a',
};

describe('orderObjectKeys', () => {
  test('should not match the stringify object', () => {
    expect(JSON.stringify(objectA)).not.toEqual(JSON.stringify(objectB));
  });

  test('should match the stringify object', () => {
    expect(JSON.stringify(orderObjectKeys(objectA))).toEqual(JSON.stringify(orderObjectKeys(objectB)));
  });
});
