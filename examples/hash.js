const EthCrypto = require('eth-crypto-js');
const { v4 } = require('uuid');

const { generateClientJWTToken } = require('./helpers/generateClientJWTToken');
const { logExampleOutput } = require('./helpers/logExampleOutput');
const { http } = require('./helpers/http');
const { localApiKey } = require('./helpers/apiKeys');

const hash = async () => {
  try {
    const message = '717ea458b62a430cb37ced7c22ebec97';
    const hash = EthCrypto.hash.keccak256(message);

    console.log({ hash }, 'hash');

    logExampleOutput({
      name: 'hash',
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

hash();
