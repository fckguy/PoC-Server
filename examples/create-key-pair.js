const EthCrypto = require('eth-crypto-js');
const { logExampleOutput } = require('./helpers/logExampleOutput');

const createKeyPair = async () => {
  try {
    const identity = EthCrypto.createIdentity();

    logExampleOutput({
      name: 'key-pairs',
      data: identity,
    });
  } catch (error) {
    console.log(error?.response || error?.message);
  }
};

createKeyPair();
