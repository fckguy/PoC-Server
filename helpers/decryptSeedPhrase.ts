import { BadRequestException } from '@nestjs/common';
import { fetchWallabyAuthKeys } from '@services/kms';
import { Encrypted } from 'eth-crypto-js';
import logger from '@helpers/logger';
import { decryptWithPrivateKey } from './decryptData';
import { ErrorResponseCodes } from '@constants/errorResponseCodes';

interface DecryptSeedPhraseParams {
  userId: string;
  encryptedSeedPhrase: Encrypted;
}

export const decryptSeedPhrase = async ({
  userId,
  encryptedSeedPhrase,
}: DecryptSeedPhraseParams): Promise<string | null> => {
  try {
    const { keyPair } = await fetchWallabyAuthKeys({ userId });

    if (!keyPair?.privateKey) {
      logger.info(`KMS: Could not retrieve keypair for userId: ${userId}`);
      throw new BadRequestException({
        errorCode: ErrorResponseCodes.auth_client_pub_key_not_found,
        message: 'The corresponding wallaby auth keys could not be found.',
      });
    }

    const seedPhrase = await decryptWithPrivateKey({
      ciphertext: encryptedSeedPhrase,
      privateKey: keyPair.privateKey,
    });

    return seedPhrase;
  } catch (error) {
    return null;
  }
};
