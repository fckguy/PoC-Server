import { verifyDomainOrSubdomain } from '@helpers/verifyDomainOrSubdomain';

describe('verifyDomainOrSubdomain', () => {
  const domainNames = ['wallaby.cash'];

  it('should accept wallaby.cash as originHost', () => {
    expect(verifyDomainOrSubdomain({ domainNames, originHost: 'wallaby.cash' })).toBeTruthy();
  });

  it('should accept the sub domain api.wallaby.cash as originHost', () => {
    expect(verifyDomainOrSubdomain({ domainNames, originHost: 'api.wallaby.cash' })).toBeTruthy();
  });

  it('should accept the sub domain capitalize domain API.WALLABY.CASH as originHost', () => {
    expect(verifyDomainOrSubdomain({ domainNames, originHost: 'API.WALLABY.CASH' })).toBeTruthy();
  });

  it('should not accept localhost as originHost', () => {
    expect(verifyDomainOrSubdomain({ domainNames, originHost: 'localhost' })).toBeFalsy();
  });
});
