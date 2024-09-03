import { verifyOrigins } from '@helpers/verifyOrigins';

describe('verifyOrigins', () => {
  const origins = ['*.wallaby.cash'];

  it('should accept wallaby.cash as originHost', () => {
    expect(verifyOrigins({ origins, originHost: 'wallaby.cash' })).toBeTruthy();
  });

  it('should accept the sub domain api.wallaby.cash as originHost', () => {
    expect(verifyOrigins({ origins, originHost: 'api.wallaby.cash' })).toBeTruthy();
  });

  it('should accept the sub domain capitalize domain API.WALLABY.CASH as originHost', () => {
    expect(verifyOrigins({ origins, originHost: 'API.WALLABY.CASH' })).toBeTruthy();
  });

  it('should not accept localhost as originHost', () => {
    expect(verifyOrigins({ origins, originHost: 'localhost' })).toBeFalsy();
  });
});
