import { generateOtp } from '@helpers/generateOtp';

describe('generateOtp', () => {
  it('should generate a 6-digit OTP', () => {
    const otp = generateOtp();
    expect(otp).toBeGreaterThanOrEqual(100000);
    expect(otp).toBeLessThanOrEqual(999999);
  });
});
