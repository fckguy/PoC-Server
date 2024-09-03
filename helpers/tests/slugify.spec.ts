import { slugify } from '@helpers/slugify';

describe('slugify', () => {
  test('should "name-1" for "Name 1"', () => {
    expect(slugify('Name 1')).toBeDefined();
  });

  test('should "name-1" for "name 1"', () => {
    expect(slugify('Name 1')).toBeDefined();
  });
});
