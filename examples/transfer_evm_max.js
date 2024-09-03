const EthCrypto = require('eth-crypto');
const { v4 } = require('uuid');
const { apiKey, localApiKey } = require('./helpers/apiKeys');
const { logExampleOutput } = require('./helpers/logExampleOutput');
const { http } = require('./helpers/http');
const { generateClientJWTToken } = require('./helpers/generateClientJWTToken');

const testSimpleTransferTx = async () => {
  try {
    const senderCredentials = {
      address: '0x22a6FC76C9FF0ef06273123234dA07484Eeb34C8',
      externalUserId: 'feb6fdb0-411d-43f6-ab2b-b862cb7c2900',
      wallabyAuthPubKey:
        'f5d9853c6822e5ec011ccd00f84de0f63e0548ebd164a7180074aa1189f2b6ca599511c9d8e42e82944da0838e599ce2c3006adcec2e75bd088925627992b60a',

      clientAuthPubKey:
        'da7d5edd1867f938f48dfd9b95ce5341c4b8cb7b9e76c93ec041e9883cacfc775c8f4a9abe3c09d3337a23d1239472137abf46966f086229d858c106193cdb62',
      clientAuthPrivKey: '0x830e968a67618af2e157e1a4f16e6001ef868ab9625ac90e83e7d4096596f3af',
      accessToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNzM2MzYyNjctN2Q0Mi00ZDZmLTlmZDEtZDIwZGY2ZWQxY2IxIiwiZXh0ZXJuYWxVc2VySWQiOiJmZWI2ZmRiMC00MTFkLTQzZjYtYWIyYi1iODYyY2I3YzI5MDAiLCJtZXJjaGFudElkIjoiYzZlN2JkYTUtZmY5OC00N2Q1LWFkMzEtNDdhY2YxMDY0ZmUwIn0sInN1YiI6IjczNjM2MjY3LTdkNDItNGQ2Zi05ZmQxLWQyMGRmNmVkMWNiMSIsImV4dGVybmFsVXNlcklkIjoiZmViNmZkYjAtNDExZC00M2Y2LWFiMmItYjg2MmNiN2MyOTAwIiwiaWF0IjoxNzIwMDA5ODYwLCJleHAiOjE3MjAwOTYyNjB9.eDPeTDiQJKfOVaKCh4cMACcM-vQ1L-73qrcdPi9MEa0',
      seedphrase:
        'tongue cruise young abstract knock present poet suggest balcony wine exhaust bless release puzzle curtain hero drip roast apple outer assault permit spatial produce',
      encryptedSeedphrase: {
        iv: '5fa0a652e71303dc772c4aa7e909eabe',
        ephemPublicKey:
          '046d5c26cffddd9519e3ca6acdcc5fc630afdc689cb9b9fabf87ffa35c39d1e3b355e3222a7fe93a5d93c49fe523e08693c6e2f5c210d74f3c094666994d0ce12a',
        ciphertext:
          '8009f889834c3afab09a99307567ffa07ba1b18865d8fd9e388318737fc79fa3f94ab70edcfa78f67488986824630878689316826f4b04b7195240de14afbde4a8beb24053d3c3df07fdce0042fc64e6714d2563d875722a9b0857cd01e543c0c719474ae6276cc24a48a434e096a52fc2ddebcee3615889a49349cce8d109ea7928ea1d796718c8449ae89ef4763ee6e81ad4fe4b1f35146bf417b65db90e0f2b4c26242c8e2d60c3a02f96d321012c',
        mac: 'da521956512368033d9b04febf8f37cd8f4cae3a1f15f1b416af6dda498e78f4',
      },
    };

    const clientJWTToken = generateClientJWTToken(senderCredentials.externalUserId);

    // User identifier from the republic
    // 1. Request for the message to be signed
    const {
      data: { message },
    } = await http.post(
      `/auth/signature-message`,
      {
        clientAuthPubKey: senderCredentials.clientAuthPubKey,
      },
      {
        headers: {
          'X-API-KEY': localApiKey,
          'X-CLIENT-JWT': clientJWTToken,
        },
      },
    );

    // 2. Sign the message
    const hashedMessage = EthCrypto.hash.keccak256(message);
    const signature = EthCrypto.sign(senderCredentials.clientAuthPrivKey, hashedMessage);

    const recipientAddress = '0x54B5404EDA54EACF64Ae75A10D29F42389770c78';
    const originAddress = senderCredentials.address;

    const encryptedSeed = await EthCrypto.encryptWithPublicKey(
      senderCredentials.wallabyAuthPubKey,
      senderCredentials.seedphrase,
    );

    const payload = {
      assetId: '75a70dc3-9b5a-44c9-a014-a2af10505d4a',
      originAddress,
      recipientAddress,
      amount: 0.1511,
      reference: v4(),
      memo: '',
      encryptedSeed,
    };

    // 3. Initiate multisig transfer the signature to the server to sign in
    const {
      data: { transaction },
    } = await http.post(
      `/transactions/transfer`,
      {
        clientAuthPubKey: senderCredentials.clientAuthPubKey,
        signature,
        message,
        ...payload,
      },
      {
        headers: {
          'X-API-KEY': localApiKey,
          'X-CLIENT-JWT': clientJWTToken,
        },
      },
    );

    logExampleOutput({
      name: 'transfer',
      data: {
        transaction,
      },
    });
  } catch (error) {
    console.log(error?.response || error?.message);
  }
};

testSimpleTransferTx();
