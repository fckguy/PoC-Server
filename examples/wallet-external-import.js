const EthCrypto = require('eth-crypto-js');
const { v4 } = require('uuid');

const { logExampleOutput } = require('./helpers/logExampleOutput');
const { http } = require('./helpers/http');
const { apiKey, localApiKey } = require('./helpers/apiKeys');
const { generateClientJWTToken } = require('./helpers/generateClientJWTToken');

const externalWalletSeedImport = async () => {
  try {
    const clientJWTToken = generateClientJWTToken('7790db51-ebec-46bb-9a77-d151aa9c7a38');

    const credentials = {
      clientAuthPubKey:
        '02176f2f1b933c3cbbe9e8fa17547ab1ce9c4e411214944d949b6396ab1862dc80198b9fd4113b1d4d06598b32f564870756670c3d977fb636e399d7b7529d3f',
      clientAuthPrivKey: '0xd2b07edc96d7ab0c127dd36acce13ded1ba704859dccd246a16655a80dd60d23',
      accessToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNTIyOTgwZGUtZjcxMy00YTJkLWFhOWEtOWJmYzNjYjMzZjY3In0sInN1YiI6IjUyMjk4MGRlLWY3MTMtNGEyZC1hYTlhLTliZmMzY2IzM2Y2NyIsImlhdCI6MTY4MDE4MzA4NCwiZXhwIjoxNjgwMjY5NDg0fQ.k9LONS_-7Q4QyY_TV5OMHitgoOIqKGo4zaUJZMMUshg',
      wallabyAuthPubKey:
        '6ae38ac8fe45e9146d0f7f1b0e4cff808836895e9236cae12f0e2720fbcd3add4d6766f9eb76a837581a9bd07e7d82bd95e5dbff5705d1cc5f24f533927d07d1',
      seedphrase:
        'solar enrich cube tent spend style nature wheel suggest junior belt young gasp swallow rib perfect parade crater jealous cloud dignity baby stereo demise',
    };

    // User identifier from the republic
    // 1. Request for the message to be signed
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

    // 2. Sign the message
    const hashedMessage = EthCrypto.hash.keccak256(message);
    const signature = EthCrypto.sign(credentials.clientAuthPrivKey, hashedMessage);

    const importedEncryptedSeed = await EthCrypto.encryptWithPublicKey(
      credentials.wallabyAuthPubKey,
      credentials.seedphrase,
    );

    const payload = {
      encryptedSeed: importedEncryptedSeed,
    };

    // 3. Initiate mnemonic seed conversion
    const {
      data: { wallet, assets, encryptedSeed },
    } = await http.post(
      `/wallets/import-seed-phrase`,
      {
        clientAuthPubKey: credentials.clientAuthPubKey,
        signature,
        message,
        ...payload,
        //
      },
      {
        headers: {
          'X-API-KEY': localApiKey,
          'X-CLIENT-JWT': clientJWTToken,
        },
      },
    );

    // console.log({ wallet, assets });

    const plainSeed = await EthCrypto.decryptWithPrivateKey(credentials.clientAuthPrivKey, encryptedSeed);

    logExampleOutput({
      name: 'wallet-import-external',
      data: {
        credentials,
        encryptedSeed,
        plainSeed,
        wallet,
        assets,
      },
    });
  } catch (error) {
    console.log(error?.response || error?.message);
  }
};

externalWalletSeedImport();
