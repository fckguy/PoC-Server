import { BadRequestException } from '@nestjs/common';
import { getAssetConfig } from './assets.config';

describe('AssetConfig', () => {
  describe('getAssetConfig', () => {
    it('should return return token not supported', () => {
      const payload = { assetSymbol: 'NOT_SUPPORTED', tokenType: 'NOT_SUPPORTED' };

      expect(() => getAssetConfig(payload)).toThrow(
        new BadRequestException('Wrong parameters not supported. assetSymbol:NOT_SUPPORTED tokenType: NOT_SUPPORTED'),
      );
    });

    it('should return return "ALGO" symbol', () => {
      const payload = { assetSymbol: 'ALGO', tokenType: 'ALGO_STANDARD' };
      const res = getAssetConfig(payload);

      expect(res.symbol).toBe(payload.assetSymbol);
    });

    it('should return return "ALGO" symbol with only "tokenType" provided', () => {
      const payload = { assetSymbol: 'ALGO' };
      const res = getAssetConfig(payload);

      expect(res.symbol).toBe(payload.assetSymbol);
    });
  });
});
