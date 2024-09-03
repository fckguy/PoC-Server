const EthCrypto = require('eth-crypto-js');
const { v4 } = require('uuid');

const { logExampleOutput } = require('./helpers/logExampleOutput');
const { http } = require('./helpers/http');

const testSimpleTransferTx = async () => {
  try {
    // API KEY needed to access any endpoint
    const apiKey = '071b51027b264a1b8fcd3d73684d25ca';

    const senderCredentials = {
      address: '0x5cBCff229229ad382fFFdDD71351fa90aF84f58A',

      clientAuthPubKey:
        'e357e9ac4275cf4fd2eb4c61f48aa7253d41218f6bea3f0196e457dbeaafe22d98954fe69367791388d7d6e265ae40b390f4c40ec734e73a804de1189a4d8966',
      clientAuthPrivKey: '0x453a3f911472cf88d2a2430ad732e9939c0192ef511a802a64fa49e977719e37',
      seedphrase:
        'brand extra evidence final erode utility book quantum exotic agree civil wire spin media discover person such grocery path figure acoustic tell cabin embark',
      encryptedSeedphrase: {
        iv: '30a3e0f4f9b27fcd0360b36762e7fd02',
        ephemPublicKey:
          '04b6a51def9d3a4524b33bced185f1eb27698d9d8794585459fddb88095cbdd9ebb3258a053942ce94c908dd8bf2cca29759728083c5dba1259f45df0d855b9ebb',
        ciphertext:
          '30f9883468cbe538a95962f58cfb14c3a423edb19a4d759ca85627b76b4bf963941aa40e6f28159451f1ddfac32cb61eb80d3e7403bd1a03c756770bc799e96db503d6f11c2364af9bee9a6d71f5d9770bd66e2d903e4ff15eed226f8e93967534433f1ff5d619446343e02e9a5de050540d3eaf7b9a45702b2db20d138ce4a2a0647b2d5a9db101bd71f8ed2d9d8ccbcdd7c313474797681281fda6b9be2f2f',
        mac: '670616f06ba0693c8578ce64bb5428b0ece0b15926cf403bfb298a93e4a0eb9a',
      },
      wallabyAuthPubKey:
        '44d872c0f0b27b2be6f531f8230012b87924f265b47c3fcde3994ca67ab5d69f4b0d779adf8660b4d7bdb42d902952709a8cdee47d8f2d6754f519209af7963a',
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
      assetId: '4b669338-b7c9-454a-893f-a84a2512e776',
      originAddress,
      recipientAddress,
      amount: 0.000432,
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
