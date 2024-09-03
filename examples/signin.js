const EthCrypto = require('eth-crypto-js');
const { v4 } = require('uuid');

const { generateClientJWTToken } = require('./helpers/generateClientJWTToken');
const { logExampleOutput } = require('./helpers/logExampleOutput');
const { http } = require('./helpers/http');
const { localApiKey } = require('./helpers/apiKeys');

const signin = async () => {
  try {
    // API KEY needed to access any endpoint
    const apiKey = localApiKey || '071b51027b264a1b8fcd3d73684d25ca';

    // The key pair should be retrieved from a secure storage
    // 1. Generate the key pair
    const credentials = {
      clientAuthPubKey:
        '4a47e489d2029b295d314570d2430d462bf91eb2d8550277b4df454e219f96eefbb281a4d3a4d46f454056840624ce80f5e10e64ff6226753b3bf8ed5134d388',
      clientAuthPrivKey: '0x2b8609a121d16be6f56e2c2373d9b63717144ce62c110a3a9c590e5cf2fcc359',
    };

    const externalUserId = process.env.externalUserId || 'c47f323c-5c3c-455f-a9f7-b484aea23f90';
    const clientJWTToken = generateClientJWTToken(externalUserId);

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
          'X-API-KEY': apiKey,
          'X-CLIENT-JWT': clientJWTToken,
        },
      },
    );

    // 3. Sign the message
    const hashedMessage = EthCrypto.hash.keccak256(message);
    const signature = EthCrypto.sign(credentials.clientAuthPrivKey, hashedMessage);

    // 4. Send the signature to the server
    const {
      data: { user, accessToken },
    } = await http.post(
      `/auth/sign-in`,
      {
        clientAuthPubKey: credentials.clientAuthPubKey,
        signature,
        message,
      },
      {
        headers: {
          'X-API-KEY': apiKey,
          'X-CLIENT-JWT': clientJWTToken,
        },
      },
    );

    logExampleOutput({
      name: 'signin',
      data: {
        credentials,
        user,
        accessToken,
      },
    });
  } catch (error) {
    console.log(error?.response || error?.message);
  }
};

signin();
