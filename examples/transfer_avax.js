const EthCrypto = require('eth-crypto-js');
const { v4 } = require('uuid');

const { logExampleOutput } = require('./helpers/logExampleOutput');
const { http } = require('./helpers/http');
const { generateClientJWTToken } = require('./helpers/generateClientJWTToken');
const { localApiKey } = require('./helpers/apiKeys');

const testSimpleTransferTx = async () => {
  try {
    // API KEY needed to access any endpoint
    const apiKey = localApiKey;

    const senderCredentials = {
      address: '0x98F375a335e1f8A4eFA7A7A0a3c4cE5C95b894C2',
      clientAuthPubKey:
        '65562dbeddf2f40bd52ebdbf5120ca62c1efbe20722c3e00af5dbdecdd73855291f9b5ecacd52ebb434e09a6fc69acf263c7cbc1920cdef187f16f6ee800d2c9',
      clientAuthPrivKey: '0x1b059d57d5c6158f83e954ceae22c84de18c555995795f1422ae5d4fd15ddfb3',
      accessToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNzI2NjBhNjktNGYxOS00YjYwLWJjMDgtMmMxMjk4MGU5YzYyIn0sInN1YiI6IjcyNjYwYTY5LTRmMTktNGI2MC1iYzA4LTJjMTI5ODBlOWM2MiIsImlhdCI6MTY4OTY5MTY4OSwiZXhwIjoxNjg5Nzc4MDg5fQ.BTjkifSMoVEUzTZIL_7R1Tp1toplVQKydE26pkcI7gA',
      externalUserId: '01611315-7c40-4089-b27d-452830a961f8',
      seedphrase:
        'civil label outdoor marine artist vendor clay craft manual assault salon inch runway expose assault moral scale radio execute damp charge abstract they dolphin',
      encryptedSeedphrase: {
        iv: 'e5e4ead01c59d68a79297b89003e2f76',
        ephemPublicKey:
          '04874d0d7fe94b6443253b6d4f2e2cfa2ddfa48199ebe0e8c42687c438e8e77e48a31deb35ac749f028a9adbe6e9140e628e67b1cc4a0b9b064585d45713bc2ec0',
        ciphertext:
          '01595ab4f029b1e8ba67a438fc4d6c109b5347052ca91a17a03827d2fc6b92235176d3b844486bee5d68d5181999b044444bb893388a206f05c7ba7be6c43ad76e7f5dffeaf99a460e678b319044cc6fb8019178c59f5005fdf51e955da507867578943e56cbf9c3e2d041accfb55ff67ce992aa9cc667d4154cfdc8cc7fc2fa43a7a1fff9fc3a6a5413a71a9490c1675f5acf67acd84b72377fbba85fe782db',
        mac: 'dd85b46fba78a2617899275568c0848d8d87c745085fa41026fd1f5dba3faf00',
      },
      wallabyAuthPubKey:
        'e897414b4d886ee901a9a721ba8abfbd4ca42b42d8f16a3905d2c030a58b99ea98a5c5d679c7d78f720fcf6143d92695fa56fbac6d4690e2e17db744ca13422a',
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
          'X-API-KEY': apiKey,
          'X-CLIENT-JWT': clientJWTToken,
        },
      },
    );

    // 2. Sign the message
    const hashedMessage = EthCrypto.hash.keccak256(message);
    const signature = EthCrypto.sign(senderCredentials.clientAuthPrivKey, hashedMessage);

    const recipientAddress = '0xa957635f22fBd234239d3E54284c82340ED8c588';
    const originAddress = senderCredentials.address;

    const encryptedSeed = await EthCrypto.encryptWithPublicKey(
      senderCredentials.wallabyAuthPubKey,
      senderCredentials.seedphrase,
    );

    const payload = {
      // assetId: 'af556908-07a5-45ab-a9d6-d131535902a5',
      assetId: '07ec642c-bc68-4a17-9e73-d407bda1376e',
      originAddress,
      recipientAddress,
      amount: 0.1,
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
        //
      },
      {
        headers: {
          'X-API-KEY': apiKey,
          'X-CLIENT-JWT': clientJWTToken,
        },
      },
    );

    logExampleOutput({
      name: 'transfer_avax',
      data: {
        transaction,
      },
    });
  } catch (error) {
    console.log(error?.response || error?.message);
  }
};

testSimpleTransferTx();
