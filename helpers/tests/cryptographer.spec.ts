import { testAccount } from '@test/data/accounts';
import { cryptographer } from '../cryptographer';

describe('cryptographer', () => {
  test('computeHash should return a string', () => {
    expect(cryptographer.generateSalt()).toBeDefined();
  });

  test('generateSalt should return a string', async () => {
    const salt = cryptographer.generateSalt();
    const hashResult = await cryptographer.computeHash({ salt, data: testAccount.phrase });

    expect(hashResult.data).toBeDefined();
    expect(hashResult.salt).toEqual(salt);
  });

  test('should return a same hash for the same data and salt', async () => {
    const salt1 = cryptographer.generateSalt();

    const hashResult1 = await cryptographer.computeHash({ salt: salt1, data: testAccount.phrase });
    const hashResult2 = await cryptographer.computeHash({ salt: salt1, data: testAccount.phrase });
    const hashResult3 = await cryptographer.computeHash({ salt: hashResult1.salt, data: testAccount.phrase });

    expect(hashResult1.data).toEqual(hashResult2.data);
    expect(hashResult2.data).toEqual(hashResult3.data);

    expect(await cryptographer.verifyHashMatch(hashResult1.data, testAccount.phrase)).toBe(true);
    expect(await cryptographer.verifyHashMatch(hashResult2.data, testAccount.phrase)).toBe(true);
    expect(await cryptographer.verifyHashMatch(hashResult3.data, testAccount.phrase)).toBe(true);
  });
});
