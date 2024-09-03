import crypto from 'crypto';

export const generateRSAKeyPair = ({ modulusLength = 2048 }: { modulusLength?: number }) => {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  return {
    privateKey,
    publicKey,
  };
};
