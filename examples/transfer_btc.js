const EthCrypto = require('eth-crypto-js');
const { v4 } = require('uuid');

const { logExampleOutput } = require('./helpers/logExampleOutput');
const { http } = require('./helpers/http');

const multisigInit = async () => {
  try {
    // API KEY needed to access any endpoint
    const apiKey = '071b51027b264a1b8fcd3d73684d25ca';

    const receiverCredentials = {
      address: 'tb1qv5h7x3hll0hhj9rkncdz4c4j6y6cky4cwdaeem',
    };

    const senderCredentials = {
      address: 'tb1qkkml0x9pa5mah4xs33alrx9pexhcdlqrxu8yqn',
      wallabyAuthPubKey:
        '6749fa0d24ba85de5878952a86191c220cf528c58a74096c5783c14a209484a65c5579eb7e676855c00f275ad8fe2de97cc7267da9031e7d34fd114dc35396f2',

      clientAuthPubKey:
        '5fa19d874e72701e9f1f7fc4bf30a0959ce7b88ae1e8c9b3a7233aea098a4ab09aceb4f834ce7205c49bb8dda45f878d5fa0500fdc1a2356313d12c8aa590ed6',
      clientAuthPrivKey: '0x526e33f7aa8dbeceb8f655f0eb0b5d26a58cffd8bb35b987d181293e7bf3b0e4',
      accessToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiYWY2N2M0ZGMtMDIwZS00YjhmLWIxZjUtMWRhYzc1MDI5MDk0IiwiZXh0ZXJuYWxVc2VySWQiOiI5NTBhNjQwZi0zOWUwLTQ1MTEtYmVkNy01MTZlM2NmZGRjNTAiLCJtZXJjaGFudElkIjpudWxsfSwic3ViIjoiYWY2N2M0ZGMtMDIwZS00YjhmLWIxZjUtMWRhYzc1MDI5MDk0IiwiZXh0ZXJuYWxVc2VySWQiOiI5NTBhNjQwZi0zOWUwLTQ1MTEtYmVkNy01MTZlM2NmZGRjNTAiLCJpYXQiOjE3MDY5ODA1ODIsImV4cCI6MTcwNzA2Njk4Mn0.1GW1wjH67QtqhgAFM3vY8ZuuSQ9kcJK-eCa7UAu4p-g',
      seedphrase:
        'snap response pet fetch butter ethics fitness beauty erosion volcano hope neither alert property farm upon together bubble shed deputy parade guitar short tool',
      encryptedSeedphrase: {
        iv: 'e7383c4c2b9156a66e17fe1fe829af0c',
        ephemPublicKey:
          '04e875ad64918bcb0646fa2203ce253d12eca10481705bb3b22bf19bcd76e5621e91cb280301612594b6e5f6e1ba2db392ca6008aa172a5e7f9b5e2755c19da857',
        ciphertext:
          'baf29b0cb45669790a5c155cc21ca4f19e6deff497894650567e4baa23853e656af9109b7950c8f8cabb83ef4e9ef6879aee100dae2e25ee40db047b76037c64b8a228211bac06e2d1580675af931b15cd26db9fe5cd694c1cd76fcffae70a00937237c549440fda9ca789a15b3824a3a2debc1e855586690d521089136f997939de9e3827b9c4137a14313c6f0405e5dafc23d6f65ca1cc079010565047fcdb',
        mac: '754f08a7f3c1b5f58d5ff5e800c52f8a75cc632acc423878f3fd9bf452709d93',
      },
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

    const recipientAddress = receiverCredentials.address;
    const originAddress = senderCredentials.address;

    const encryptedSeed = await EthCrypto.encryptWithPublicKey(
      senderCredentials.wallabyAuthPubKey,
      senderCredentials.seedphrase,
    );

    const payload = {
      assetId: '52f2aeaf-652e-4766-a3a5-3ec29e458f87',
      originAddress,
      recipientAddress,
      amount: 0.00043428,
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
        },
      },
    );

    logExampleOutput({
      name: 'transfer-btc',
      data: {
        transaction,
      },
    });
  } catch (error) {
    console.log(error?.response || error?.message);
  }
};

multisigInit();
