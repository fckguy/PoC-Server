const EthCrypto = require('eth-crypto-js');
const { v4 } = require('uuid');

const { logExampleOutput } = require('./helpers/logExampleOutput');
const { http } = require('./helpers/http');

const testSimpleTransferTx = async () => {
  try {
    // API KEY needed to access any endpoint
    const apiKey = '071b51027b264a1b8fcd3d73684d25ca';

    const senderCredentials = {
      address: '0xF84E12F40FC501BB56eA96A4E3D0aB4e93c2cE02',
      clientAuthPubKey:
        '8a7d4e157945e3367ba06f3457e6540e2949df91290f224f8ecec0245a854afc9aa955e8cef3943b06919526477c074d57d7e07620e6c5ff09a98e60589d4383',
      clientAuthPrivKey: '0xf2dec8c482bcce671763b2d4ea2dbb50c7fcc6e38c80c20ef08f47ee05413e53',
      seedphrase:
        'question spice zero hair defense version hope female spend prevent flip rifle ship wink flight venue dish census punch lemon wish ability vault resource',
      encryptedSeedphrase: {
        iv: 'd5ff9d7288bc0e67bb9e51f31ce271ae',
        ephemPublicKey:
          '044d0e8305dcfc6889a3b9c07f1d82f736b62ced6f76ceb31451d5e12ee5246fe371fe37f0a0f7a22ef83305ff1214a8b0f29a3836fe2def7c2d491f46fb91049d',
        ciphertext:
          '911a7131b4c6377b55d3c03166ebb9e309c5559a408c60ef9c86e32a3bfae8d3413a815bb7d601e15130abd1a559b2afa89d91a6ac597899ece76b14fe4a34dd06f724017922fe83d1f2eb252785bae275d40248aa8b50b859be06e8063bd9b37c5d874792fcb10c680cf97a503f11bac48164a6f9db99ded6d51ecfc56515842161954bb34ef02369c9d381598d840635ea22d038469bb7523689e19156b831',
        mac: '4e22190f7497817a934c791df8bb72aa833fcf105161845629482bee602d61e3',
      },
      wallabyAuthPubKey:
        '615b0d328fa4e36b40e2ecb3ec594541bfe11d879d87fa5e28c1515b4b06c9f7b8603c6d84cb1a7e9dd25d2b5a15391b56b1396181c029828b52bf77a996e5ec',
    };

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
        },
      },
    );

    // 2. Sign the message
    const hashedMessage = EthCrypto.hash.keccak256(message);
    const signature = EthCrypto.sign(senderCredentials.clientAuthPrivKey, hashedMessage);

    const recipientAddress = '0x7bbe910666e099ed6daaC17371DeB0897194022C';
    const originAddress = senderCredentials.address;

    const encryptedSeed = await EthCrypto.encryptWithPublicKey(
      senderCredentials.wallabyAuthPubKey,
      senderCredentials.seedphrase,
    );

    const payload = {
      assetId: '3c3ca514-03b9-43f6-a42b-c17a85aa8cfa',
      originAddress,
      recipientAddress,
      amount: 0.000532,
      reference: v4(),
      memo: '',
      encryptedSeed,
    };

    // 3. Initiate multisig transfer the signature to the server to sign in
    const {
      data: { transaction },
    } = await http.post(`/transactions/transfer`, {
      clientAuthPubKey: senderCredentials.clientAuthPubKey,
      signature,
      message,
      ...payload,
      //
    });

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
