import 'dotenv/config';
import axios from 'axios';
import { InternalServerErrorException } from '@nestjs/common';
import EthCrypto from 'eth-crypto-js';
import logger from '@helpers/logger';

const http = axios.create({
  baseURL: `${process.env.KMS_SERVICE_BASE_URL}`,
  headers: {
    Authorization: `Bearer ${process.env.KMS_SERVICE_BEARER_TOKEN}`,
  },
});

interface KMSResponse {
  keyPair?: { privateKey: string; publicKey: string } | null;
  keyName: string | null;
  keyVersion: string | null;
}

export const fetchRandomBytes = async ({
  size = 256,
}: {
  size: number;
}): Promise<{ plaintext: string | null; bytes?: string | null }> => {
  try {
    const { data } = await http.get(`/random-bytes?size=${size}`);
    return data;
  } catch (error) {
    logger.error(`[fetchRandomBytes]: failed ${error.message} ${error.stack}`, {
      error,
    });
    throw new InternalServerErrorException('There was an error fetching random bytes from KMS');
  }
};

export const fetchWallabyAuthKeys = async ({
  userId,
  wallabyAuthVersion = 'latest',
}: {
  wallabyAuthVersion?: string;
  userId: string;
}): Promise<KMSResponse> => {
  try {
    const identity = EthCrypto.createIdentity();

    const { data } = await http.get(
      `/key-pair/${userId}?keyVersion=${wallabyAuthVersion}&encryptionPubKey=${identity.publicKey}`,
    );

    const plaindata = await EthCrypto.decryptWithPrivateKey(identity.privateKey, data);

    return JSON.parse(plaindata) as KMSResponse;
  } catch (error) {
    logger.error(`failed fetching auth keys${error.message}`, { error });
    return { keyPair: null, keyName: null, keyVersion: null };
  }
};

export const createNewWallabyAuthKeys = async ({
  userId,
}: {
  wallabyAuthVersion?: string;
  userId: string;
}): Promise<KMSResponse> => {
  try {
    const identity = EthCrypto.createIdentity();
    const query = `keyName=${userId}&keyVersion=latest&encryptionPubKey=${identity.publicKey}`;
    const { data } = await http.get(`/key-pair/${userId}/get-or-create?${query}`);

    const plaindata = await EthCrypto.decryptWithPrivateKey(identity.privateKey, data);
    return JSON.parse(plaindata) as KMSResponse;
  } catch (error) {
    logger.error(`failed to get or create auth keys${error?.message} ${error?.stack}`, { error });
    throw new InternalServerErrorException('Error occurred during new auth keys generation');
  }
};
