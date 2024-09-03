import * as EthCrypto from 'eth-crypto-js';
import { logger } from '@helpers/logger';

export const signMessage = ({ message, privateKey }: { message: string; privateKey: string }): string | null => {
  try {
    const messageHash = EthCrypto.hash.keccak256(message);
    const signature = EthCrypto.sign(privateKey, messageHash);

    return signature;
  } catch (error) {
    logger.error(error?.message);
    return null;
  }
};

export const verifySignature = ({
  signature,
  message,
  publicKey,
}: {
  signature: string;
  message: string;
  publicKey: string;
}): boolean => {
  try {
    const messageHash = EthCrypto.hash.keccak256(message);
    const signer = EthCrypto.recoverPublicKey(signature, messageHash);

    return publicKey && signer && signer.toLowerCase() === publicKey.toLowerCase();
  } catch (error) {
    logger.error(error);
    return false;
  }
};

export const decryptWithPrivateKey = async ({
  message,
  privateKey,
}: {
  message: EthCrypto.Encrypted;
  privateKey: string;
}): Promise<string | null> => {
  try {
    const plainMessage = await EthCrypto.decryptWithPrivateKey(privateKey, message);

    return plainMessage;
  } catch (error) {
    logger.error(error);
    return null;
  }
};
