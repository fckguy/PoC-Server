import { fetchRandomBytes } from './kms';

describe('kms', () => {
  describe('getRandomBytes', () => {
    it('should return random bytes', async () => {
      const randomBytes = await fetchRandomBytes({ size: 256 });

      expect(randomBytes).toBeDefined();
    });
  });
});
