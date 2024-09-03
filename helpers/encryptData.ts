import EthCrypto, { Encrypted } from 'eth-crypto-js';

export const encryptWithPublicKey = async ({
  publicKey,
  text,
}: {
  publicKey: string;
  text: string;
}): Promise<Encrypted> => {
  const encryptedData = await EthCrypto.encryptWithPublicKey(publicKey, text);

  return encryptedData;
};

export const encryptWithPrivateKey = async ({
  privatekey,
  encrypted,
}: {
  privatekey: string;
  encrypted: Encrypted;
}): Promise<string> => {
  const encryptedData = await EthCrypto.decryptWithPrivateKey(privatekey, encrypted);

  return encryptedData;
};
