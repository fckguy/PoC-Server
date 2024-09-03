import EthCrypto, { Encrypted } from 'eth-crypto-js';
import logger from './logger';

export const decryptWithPrivateKey = async ({
  privateKey,
  ciphertext,
}: {
  privateKey: string;
  ciphertext: Encrypted;
}): Promise<string | null> => {
  try {
    const plaintext = await EthCrypto.decryptWithPrivateKey(privateKey, ciphertext);

    return plaintext;
  } catch (error) {
    logger.error(`decryptWithPrivateKey ${error.message} ${error.stack}`.trim(), { error });
    return null;
  }
};
