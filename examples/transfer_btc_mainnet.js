const EthCrypto = require('eth-crypto-js');
const { v4 } = require('uuid');

const { logExampleOutput } = require('./helpers/logExampleOutput');
const { http } = require('./helpers/http');

const multisigInit = async () => {
  try {
    // API KEY needed to access any endpoint
    const apiKey = '071b51027b264a1b8fcd3d73684d25ca';

    const receiverCredentials = {
      address: 'bc1qr8e0f3qv2jcc86yxt9flurgmxshnsvqqw0u0h4',
    };

    const senderCredentials = {
      address: 'bc1qfre8ug7nswr7c24w5eztzge94zusdn704exne9',
      wallabyAuthPubKey:
        '6749fa0d24ba85de5878952a86191c220cf528c58a74096c5783c14a209484a65c5579eb7e676855c00f275ad8fe2de97cc7267da9031e7d34fd114dc35396f2',

      clientAuthPubKey:
        '5fa19d874e72701e9f1f7fc4bf30a0959ce7b88ae1e8c9b3a7233aea098a4ab09aceb4f834ce7205c49bb8dda45f878d5fa0500fdc1a2356313d12c8aa590ed6',
      clientAuthPrivKey: '0x526e33f7aa8dbeceb8f655f0eb0b5d26a58cffd8bb35b987d181293e7bf3b0e4',
      accessToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiYWY2N2M0ZGMtMDIwZS00YjhmLWIxZjUtMWRhYzc1MDI5MDk0IiwiZXh0ZXJuYWxVc2VySWQiOiI5NTBhNjQwZi0zOWUwLTQ1MTEtYmVkNy01MTZlM2NmZGRjNTAiLCJtZXJjaGFudElkIjpudWxsfSwic3ViIjoiYWY2N2M0ZGMtMDIwZS00YjhmLWIxZjUtMWRhYzc1MDI5MDk0IiwiZXh0ZXJuYWxVc2VySWQiOiI5NTBhNjQwZi0zOWUwLTQ1MTEtYmVkNy01MTZlM2NmZGRjNTAiLCJpYXQiOjE3MDY5ODA1ODIsImV4cCI6MTcwNzA2Njk4Mn0.1GW1wjH67QtqhgAFM3vY8ZuuSQ9kcJK-eCa7UAu4p-g',
      seedphrase:
        'execute quality cabbage airport flight good favorite theme cause track isolate special clay impact author deal toilet adult snake salt eye embark pony broom',
      encryptedSeedphrase: {
        iv: '280ef87e000824fca4e794d3a0196f84',
        ephemPublicKey:
          '04a45fdced8b9d93efbf1ad3e92d4255a753029cf4e8490f75e51fa4f49070cbc906ca9fda2702e98e7e94809aa665b91b92e5d55cbea0c5e9d7b96a86eec8b01b',
        ciphertext:
          '00ae0e2679e2118946a322d7174e7c19a17f982b5d4c27ee0cc6f09c52ae97f9a9dea082ad8ad1154a0d8a219cc95e173f55bfec2f31c134ebbffff14344887b661d99fa8320cb2f6ff1b2293b18627b702425bcede2d4fcb374bb74a52f57c466b3ca026de1c99d7a3523ce22e84ce5fff495aa6f9db7a2d42c64d3b3bd02d1c85c5034da32557dbfbd25da09171b39538af2a9b576017333119659bea87bf7',
        mac: '849d9a857e22b98d8941a9938be35431d1db9dd9fbcc64f34b4f9ee61e289786',
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
      amount: 0.0001342,
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

  // First successful on-chain transaction
  // https://chain.so/tx/BTC/94d5a1dc76a0794de6e7cb4d6136ff94bf86b7449cc720888748ca4762f4f377
};

multisigInit();
