const EthCrypto = require('eth-crypto-js');
const { v4 } = require('uuid');

const { logExampleOutput } = require('./helpers/logExampleOutput');
const { http } = require('./helpers/http');
const { apiKey } = require('./helpers/apiKeys');

const multisigRawTxInit = async () => {
  const initiator = {
    credentials: {
      clientAuthPubKey:
        'd9bbaa00c83bfc6a78aac52682f0895061ea6d79ef5fb42d6382517bd9476fcae448ff03e2e8ef178402052ddd616314bbd5ce65e0e70978d405216099b871d1',
      clientAuthPrivKey: '0x43cdf9ce6391d0f9a1834b3b170c0f258296b7f20ebf9c2fe8dac56d4213d1ab',
      accessToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjM5NTMwY2YtODFmMi00MmExLTliMTYtZjViYmI2NmMwNmVjIn0sInN1YiI6IjYzOTUzMGNmLTgxZjItNDJhMS05YjE2LWY1YmJiNjZjMDZlYyIsImlhdCI6MTY3NDIwNTM2OX0.kWHfrbW8si2bOiC-aFapb9S8OL3EEGEMmpfuyaNMQ08',
      seedphrase:
        'popular cherry focus shop exhibit below arrive version chef tuna diesel enforce wire actor jeans laptop normal humor assist account adapt photo slim huge',
      encryptedSeedphrase: {
        iv: '7284fa6c939302f1497952bac1ea249f',
        ephemPublicKey:
          '04882b4ea491120fab9685e1384d742133393f7dc41ea495765a1c0426b7a6658f57d73f83378af1c799bcd02a6c647ba1d1d8ae22764e07709f1eb713849f7ffe',
        ciphertext:
          '2e97451f2e11622c513cc15bc3a058ebafd6b525d4ef8fdd04e98f9ee0f7c8a31760887f9ab11574673574ce5773723d0061f52ef41f34d8787844d70440fb7c1f33cb9b59a08096f5783be1ef1119d898505d577fd09564b3b916b857142386971ac2b29c5a860cf7477db5a19d70ad42cfd19eddd3a9c66745634e47cf867a5890312654d185b81c5a44b8b2ffa30cc241fd737a122341e13d3a5c12c31001',
        mac: '033424517573e467fc887803e165fba004c17c96c0e81aec3a423d45f0545791',
      },
      wallabyAuthPubKey:
        '4b00e61519317051ac913de7e4bc740536e9c91656894db1448b101e8dde64ece54894365c91bcd5cea0372d1257d502b060b0f9ba82ae26dab59f4b5dffe2d5',
    },
  };

  try {
    // 1. Request for the message to be signed
    const {
      data: { message },
    } = await http.post(
      `/auth/signature-message`,
      {
        clientAuthPubKey: initiator.credentials.clientAuthPubKey,
      },
      {
        headers: {
          'X-API-KEY': apiKey,
        },
      },
    );

    // 2. Sign the message
    const hashedMessage = EthCrypto.hash.keccak256(message);
    const signature = EthCrypto.sign(initiator.credentials.clientAuthPrivKey, hashedMessage);

    const initialSignerEncryptedSeedPhrase = await EthCrypto.encryptWithPublicKey(
      initiator.credentials.wallabyAuthPubKey,
      initiator.credentials.seedphrase,
    );

    const body = {
      reference: v4(),
      assetSymbol: 'ALGO',
      initiatorAddress: 'R73PEI7F7FB265ETGPCBGBFCVOX2YTO5THIEKUAVDWZ7EAQCBBKWKHS5LY',
      rawTransaction: {
        appIndex: 13997710,
        appArgs: [],
        onComplete: 1,
        accounts: ['JELJ5Z5LVWSZLTN3SZJOMFZNPYWEHJM3ZWYQ6OJFCRXQFMIN5MXK7GQ6DU'],
      },
      multisigParams: {
        version: 1,
        threshold: 2,
        addrs: [
          'R73PEI7F7FB265ETGPCBGBFCVOX2YTO5THIEKUAVDWZ7EAQCBBKWKHS5LY',
          'YQLNQBUMEXJAE6UWF6Y4F43D5ONR2UIR7Y4XWWJA44CQR3DP5NDRDIJJIY',
          'ZZSNBESRVN6GWOIZUSLCIXZ5CEZ6D6JGXC2SWCAEWEJGRJVVJ7SYB63TY4',
        ],
      },
      initialSignerEncryptedSeed: initialSignerEncryptedSeedPhrase,
    };

    const { data } = await http.post(
      `/transactions/init-sign-broadcast-multisig-rawtx`,
      {
        ...body,

        signature,
        clientAuthPubKey: initiator.credentials.clientAuthPubKey,
        message,
      },
      {
        headers: {
          'X-API-KEY': apiKey,
        },
      },
    );

    logExampleOutput({
      name: 'multisig-rawtx-init',
      data: {
        ...data,
      },
    });
  } catch (error) {
    console.log(error?.response || error?.message);
  }
};

multisigRawTxInit();
