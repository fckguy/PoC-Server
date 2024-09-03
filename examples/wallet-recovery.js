const EthCrypto = require('eth-crypto-js');

const { logExampleOutput } = require('./helpers/logExampleOutput');
const { http } = require('./helpers/http');

const optIn = async () => {
  // API KEY needed to access any endpoint
  const apiKey = '071b51027b264a1b8fcd3d73684d25ca';

  const identity = EthCrypto.createIdentity();
  const credentials = {
    clientAuthPubKey: identity.publicKey,
    clientAuthPrivKey: identity.privateKey,
    seedphrase:
      'universe smoke noodle magic advice belt cradle name awkward destroy boil web advance rookie dad business pyramid alter thought minute couch gift decline action',
    encryptedSeedphrase: {
      iv: '3fcd843fcb73aa307e15987f377b767d',
      ephemPublicKey:
        '04f6b208cebe0807e008419918df8e0616230cdd338297b3777378250942aa0594ffb91084cdb051ba1a321882b990d064df1699a55b53d1aeb7c46a4122d0d4bd',
      ciphertext:
        'a7c04d3abbb24084425124c93c147e1c8499d320468bae72a34a1f3c9e5e04eb04d67d9d904d734a969984846d966233785cb49b857b82a95acf4804f3d125fa73cccfa39f639ded49bb78f16d46f400020e0cdc0f3fa05bed5e7f25737345da1027f7c1dfa2539e00ef810603031a63caf5aceb85d8293d90bcfb5d5c496cc2ca570e76297bd5135cb7eac781ec51b184f56086bb32b22b89516402c7235d67',
      mac: 'cf51afb231531a2012e44ce5d1b14432535eed4457c972e2914e94d459da4329',
    },
    address: 'ZHTUYTLUYKY2IHIQ5Q227JIEGONITDWHDGNOXJJTC7UIDQVORA2EGCWFXM',
    wallabyPubKey:
      '56f33914987dcdd38b8ae4f39d8cb0336835fe8ee5fbbbb722ec92b6b6ad2b703ba2402cd9cf69bea9bbd8cd92b722c79399e9e7a4bf91c64cec1b75130f0b0e',
    externalUserId: 'ce9e7808-4b80-4870-a3f9-67f69a479100',
  };

  try {
    const initResponse = await http.post(
      `/wallets/recover/init`,
      {
        clientAuthPubKey: credentials.clientAuthPubKey,
        externalUserId: credentials.externalUserId,
      },
      {
        headers: {
          'X-API-KEY': apiKey,
        },
      },
    );

    const message = initResponse.data.signatureMessage;
    const wallabyAuthPubKey = initResponse.data.wallabyAuthPubKey;

    const hashedMessage = EthCrypto.hash.keccak256(message);
    const signature = EthCrypto.sign(credentials.clientAuthPrivKey, hashedMessage);

    const encryptedSeed = await EthCrypto.encryptWithPublicKey(
      wallabyAuthPubKey || credentials.wallabyPubKey,
      credentials.seedphrase,
    );

    const res = await http.post(
      `/wallets/recover`,
      {
        clientAuthPubKey: credentials.clientAuthPubKey,
        signature,
        encryptedSeed,
        message,
        externalUserId: credentials.externalUserId,
      },
      {
        headers: {
          'X-API-KEY': apiKey,
        },
      },
    );

    logExampleOutput({
      name: 'wallet-recovery',
      data: {
        ...res.data,
      },
    });
  } catch (error) {
    console.log(error?.response?.data || error?.message);
  }
};

optIn();
