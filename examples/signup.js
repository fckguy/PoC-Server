const EthCrypto = require('eth-crypto-js');
const { v4 } = require('uuid');
const { faker } = require('@faker-js/faker');

const { logExampleOutput } = require('./helpers/logExampleOutput');
const { http } = require('./helpers/http');
const { apiKey, localApiKey } = require('./helpers/apiKeys');
const { generateClientJWTToken } = require('./helpers/generateClientJWTToken');
const sha256 = require('crypto-js/sha256');

const signup = async () => {
  try {
    // 1. Generate the key pair
    // The key pair should be retrieved from a secure storage
    const identity = EthCrypto.createIdentity();

    const credentials = {
      clientAuthPubKey: identity.publicKey,
      clientAuthPrivKey: identity.privateKey,
    };

    // User identifier from the republic
    const externalUserId = v4();
    const clientJWTToken = generateClientJWTToken(externalUserId);
    console.log({ clientJWTToken });

    // 2. Request for the message to be signed
    const {
      data: { message },
    } = await http.post(
      `/auth/signature-message`,
      {
        clientAuthPubKey: credentials.clientAuthPubKey,
      },
      {
        headers: {
          'X-API-KEY': localApiKey,
          'X-CLIENT-JWT': clientJWTToken,
        },
      },
    );

    // 3. Sign the message
    const hashedMessage = EthCrypto.hash.keccak256(message);
    const signature = EthCrypto.sign(credentials.clientAuthPrivKey, hashedMessage);

    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    // 4. Send the signature to the server to sign up
    const {
      data: { user, accessToken },
    } = await http.post(
      `/auth/sign-up`,
      {
        clientAuthPubKey: credentials.clientAuthPubKey,
        signature,
        message,
        externalUserId,
        firstName,
        lastName,
        email: `${firstName}.${lastName}@email.com`,
      },
      {
        headers: {
          'X-API-KEY': localApiKey,
          'X-CLIENT-JWT': clientJWTToken,
        },
      },
    );

    logExampleOutput({
      name: 'signup',
      data: {
        credentials,
        externalUserId,
        user,
        accessToken,
      },
    });
  } catch (error) {
    console.log(error?.response || error?.message);
  }
};

signup();
