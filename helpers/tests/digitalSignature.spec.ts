import EthCrypto from 'eth-crypto-js';
import { testAccount } from '@test/data/accounts';
import { signMessage, verifySignature } from '../digitalSignature';

describe('digitalSignature', () => {
  describe('signMessage', () => {
    test('should not sign a with a wrong private key', async () => {
      const signature = signMessage({
        message: 'trying to sign with wrong invalid private key',
        privateKey: 'wrong-private-key',
      });

      expect(signature).toBeFalsy();
    });

    test('should return signature data', async () => {
      const signature = signMessage({
        message: 'any message in string format',
        privateKey: testAccount.privateKey,
      });

      expect(signature).toBeDefined();
    });
  });

  describe('verifySignature', () => {
    test('should not verify a signture from a different private key', async () => {
      const identity1 = EthCrypto.createIdentity();
      const identity2 = EthCrypto.createIdentity();

      const message = JSON.stringify({ publicKey: testAccount.publicKey });
      const signature = signMessage({
        message,
        privateKey: identity1.privateKey,
      });

      const isValid = verifySignature({
        message,
        signature,
        publicKey: identity2.publicKey,
      });

      expect(isValid).not.toBeTruthy();
    });

    test('should validate the correct message signer', async () => {
      const identity = EthCrypto.createIdentity();

      const message = JSON.stringify({ publicKey: identity.publicKey });
      const signature = signMessage({
        message,
        privateKey: identity.privateKey,
      });

      const isValid = verifySignature({
        message,
        signature,
        publicKey: identity.publicKey,
      });

      expect(isValid).toBeTruthy();
    });
  });
});
