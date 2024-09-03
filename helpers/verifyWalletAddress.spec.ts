import { isAlgoAddress, isBtcAddress, isEvmAddress } from './verifyWalletAddress';

describe('verifyWalletAddress', () => {
  describe('isEvmAddress', () => {
    it('should return true if the address is a valid EVM address', () => {
      expect(isEvmAddress('0x5AEDA56215b167893e80B4fE645BA6d5Bab767DE')).toBe(true);
    });

    it('should return false if the address is not a valid EVM address', () => {
      expect(isEvmAddress('5AEDA56215b167893e80B4fE645BA6d5Bab767DE')).toBe(false);
    });
  });

  describe('isBtcAddress', () => {
    it('should return true if the address is a valid BTC address - Legacy address', () => {
      expect(isBtcAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')).toBe(true);
    });

    it('should return true if the address is a valid BTC address - Segwit address', () => {
      expect(isBtcAddress('bc1qqpvl3kpwmssff0qxpysuy5rp8wjepj450eer5w')).toBe(true);
    });
  });

  describe('isAlgoAddress', () => {
    it('should return true if the address is a valid Algorand address', () => {
      expect(isAlgoAddress('G26FDAHTN5HSBL3M6FRFHWSH43OWOMHFCVLHN3VWBO667SUZHJSFH3D2XU')).toBe(true);
    });
  });

  describe('isSupportedWalletAddress', () => {
    it('should return true if the address is a valid EVM address', () => {
      expect(isEvmAddress('0x5AEDA56215b167893e80B4fE645BA6d5Bab767DE')).toBe(true);
    });

    it('should return true if the address is a valid BTC address - Segwit address', () => {
      expect(isBtcAddress('bc1qqpvl3kpwmssff0qxpysuy5rp8wjepj450eer5w')).toBe(true);
    });

    it('should return true if the address is a valid Algorand address', () => {
      expect(isAlgoAddress('G26FDAHTN5HSBL3M6FRFHWSH43OWOMHFCVLHN3VWBO667SUZHJSFH3D2XU')).toBe(true);
    });
  });
});
