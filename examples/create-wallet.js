const EthCrypto = require('eth-crypto-js');
const { v4 } = require('uuid');
const { logExampleOutput } = require('./helpers/logExampleOutput');
const { http } = require('./helpers/http');
const { generateClientJWTToken } = require('./helpers/generateClientJWTToken');
const { apiKey, localApiKey } = require('./helpers/apiKeys');
const { ed25519HdKey } = require('ed25519-hd-key');

const createWallet = async () => {
  try {
    // 1. Generate the key pair

    // The key pair should be retrieved from a secure storage
    const credentials = {
      clientAuthPubKey:
        '5fa19d874e72701e9f1f7fc4bf30a0959ce7b88ae1e8c9b3a7233aea098a4ab09aceb4f834ce7205c49bb8dda45f878d5fa0500fdc1a2356313d12c8aa590ed6',
      clientAuthPrivKey: '0x526e33f7aa8dbeceb8f655f0eb0b5d26a58cffd8bb35b987d181293e7bf3b0e4',
      accessToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiYWY2N2M0ZGMtMDIwZS00YjhmLWIxZjUtMWRhYzc1MDI5MDk0IiwiZXh0ZXJuYWxVc2VySWQiOiI5NTBhNjQwZi0zOWUwLTQ1MTEtYmVkNy01MTZlM2NmZGRjNTAiLCJtZXJjaGFudElkIjpudWxsfSwic3ViIjoiYWY2N2M0ZGMtMDIwZS00YjhmLWIxZjUtMWRhYzc1MDI5MDk0IiwiZXh0ZXJuYWxVc2VySWQiOiI5NTBhNjQwZi0zOWUwLTQ1MTEtYmVkNy01MTZlM2NmZGRjNTAiLCJpYXQiOjE3MDY5ODA1ODIsImV4cCI6MTcwNzA2Njk4Mn0.1GW1wjH67QtqhgAFM3vY8ZuuSQ9kcJK-eCa7UAu4p-g',
    };

    // User identifier from the republic
    const externalUserId = 'aba87484-d30d-4d49-bbb2-ef05e4f8e76b';
    const clientJWTToken = generateClientJWTToken(externalUserId);
    console.log({ clientJWTToken });

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
          'X-API-KEY': apiKey,
          'X-CLIENT-JWT': clientJWTToken,
        },
      },
    );

    // 2. Sign the message
    const hashedMessage = EthCrypto.hash.keccak256(message);
    const signature = EthCrypto.sign(credentials.clientAuthPrivKey, hashedMessage);

    // 3. Send the signature to the server to sign in
    const {
      data: { wallet, assets, encryptedSeed },
    } = await http.post(
      `/wallets/create`,
      {
        clientAuthPubKey: credentials.clientAuthPubKey,
        signature,
        message,
      },
      {
        headers: {
          'X-API-KEY': apiKey,
          'X-CLIENT-JWT': clientJWTToken,
          Authorization: 'Bearer ' + credentials.accessToken,
        },
      },
    );

    // 4. Decrypt the encrypted seed with the user's private key
    const plainSeed = await EthCrypto.decryptWithPrivateKey(credentials.clientAuthPrivKey, encryptedSeed);

    credentials.seedphrase = plainSeed;
    credentials.encryptedSeedphrase = encryptedSeed;

    const seedBuffer = Buffer.from(plainSeed, 'hex');
    const masterKey = Ed25519HdKey.fromMasterSeed(seedBuffer);
    const derivationPath = "m/44'/784'/0'/0'/0'"; 
    const suiHdKey = await masterKey.derive(derivationPath);

    const suiAddress = suiHdKey.getAddress();
    const suiPublicKey = suiHdKey.getPublicHexString();
    const suiPrivateKey = suiHdKey.getPrivateHexString();

    logExampleOutput({
      name: 'create-wallet',
      data: {
        credentials,
        encryptedSeed,
        plainSeed,
        wallet,
        assets,
        suiAddress,
        suiPublicKey,
        suiPrivateKey
      },
    });
  } catch (error) {
    console.log(error?.response || error?.message);
  }
};

createWallet();
