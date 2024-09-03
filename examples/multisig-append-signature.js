const EthCrypto = require('eth-crypto-js');

const { logExampleOutput } = require('./helpers/logExampleOutput');
const { http } = require('./helpers/http');
const { apiKey } = require('./helpers/apiKeys');

const signOnMultisigRequest = async () => {
  try {
    const participants = [
      {
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
          address: 'R73PEI7F7FB265ETGPCBGBFCVOX2YTO5THIEKUAVDWZ7EAQCBBKWKHS5LY',
        },
      },
      {
        credentials: {
          clientAuthPubKey:
            '4195b3c98658d1a7bf8bccf119aed0c5b0c7392fef5f66c6993c966a3ecc9f3c64555c1c76855ba29660056aec2cbe160f026f5a5f87f0f9b32d142ae1dd7d6c',
          clientAuthPrivKey: '0x435e1a2410a16bfe4356653420ec5330d2f07ebb476586d2386be15e744de285',
          accessToken:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiMThkNTFjZTEtYTQyNi00M2M0LWExNzItODRhODMzYWJiNjY4In0sInN1YiI6IjE4ZDUxY2UxLWE0MjYtNDNjNC1hMTcyLTg0YTgzM2FiYjY2OCIsImlhdCI6MTY3NDIwNTQwM30.hnFD1BkJ-XPHIH8X1aLiM6EhmLFo-g9vUctpAiDoGl8',
          seedphrase:
            'icon old goose box garden divorce version rough moon elephant total satisfy teach minor client meat boil account decline seminar person hundred album riot',
          encryptedSeedphrase: {
            iv: '6965cdbb802062a4c615e2add5fe3689',
            ephemPublicKey:
              '040992a13ab3730d73bca7cfabe1afd79d56ec53537d263ac12a33024854001f4ee21fa3e1eea6638e5a546c0c93b5572b50244e91318330fd64874019b3fbcd63',
            ciphertext:
              'e8219f588c77029a3416ac74eb4b6f54b99c501a7df7115e4b2e248f423e5b42ed3fcf9b4a632c1c330eb9950fe998e176d8f8c0753d5ecbd756d2574336817d602a4273a502d47ee274c7ea752c23a10f93c47d786138ba473cc4e5c026dc3514793873bc657279e88b47fd5d2d663c7e1e9e1204c3ec77a313b677dc23be3ebf235e1020faf74f2cbeab5dabf1abd80557826afe310f62188729ca974b6d4a',
            mac: '7f3d90ef5d4fe6f7484b36dbb5c7ff202d8f598a6a472971dff7f712390f3c35',
          },
          address: 'YQLNQBUMEXJAE6UWF6Y4F43D5ONR2UIR7Y4XWWJA44CQR3DP5NDRDIJJIY',
          wallabyAuthPubKey:
            '5924c087b16a0968fbf4e36089a6fd031cac2ac80fbe53de524146f512762601e830a85190a059e22d65b6e1349a54bb2da6c955c7fbaee89f3ed1e93f2795ea',
        },
      },

      {
        credentials: {
          clientAuthPubKey:
            '51e08ace5bd5488841d917fed0ec7c9e7b97ed7d83270ae35cd6d171cc6d4e0909d277066aa8657267be8e38dfb83dfdb07785cab770179c720da28c2b8c75ec',
          clientAuthPrivKey: '0xc61a85d51f16fa3be88ca1102ce1a10627ee6bd52d21220818089202d92741fe',
          accessToken:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNGEzNDZlNjMtMzhlZC00NDY2LTk5MDQtMGVjM2Q1MGYwNDlhIn0sInN1YiI6IjRhMzQ2ZTYzLTM4ZWQtNDQ2Ni05OTA0LTBlYzNkNTBmMDQ5YSIsImlhdCI6MTY3NDIwNTQyN30._EkP380AiNXGtsgXxT4qm4SKePwOpp65rO6PFBfiQ6c',
          seedphrase:
            'violin wave mass grass heavy error weather gasp random multiply strike able cloth before online work flush insane sing cattle proud ecology shed rice',
          encryptedSeedphrase: {
            iv: 'd12d4279713d17290f2d59899a98583e',
            ephemPublicKey:
              '040ec12727ff3afc0c29cd80c7db1e38a988840254c60fa1fc2ceacbe57f001321f0002011c49532319852a4ec6da6d9f028fbdb283fbfffeed8543e2ec7a87bb0',
            ciphertext:
              '45e233012be741632286d928a9cab4e10a54d5df18760abeb6bc2a922bbd1d6832d0b81a36ca56bc683eb18c9895c9ce91e653684d1713d38811ea3e320324bf67c53c6635f379038177b65e4049b79eec8c4000ebb5f010a94f0bce6653b58a182f49033a4d463875d3271c17cae9eb093cf6a85e5fed8356c03185d46238077a1307e67bb216fb18614393d9f0c3505590a0c9173e44ef40acea5491cee0bf',
            mac: 'fe5adb9c71e3024d6dd10b75e6113ca4b5b35208a3bad69426a4bd11722deb76',
          },
          address: 'ZZSNBESRVN6GWOIZUSLCIXZ5CEZ6D6JGXC2SWCAEWEJGRJVVJ7SYB63TY4',
        },
      },
    ];
    // User identifier from the republic
    // 1. Request for the message to be signed
    const {
      data: { message },
    } = await http.post(
      `/auth/signature-message`,
      {
        clientAuthPubKey: participants[1].credentials.clientAuthPubKey,
      },
      {
        headers: {
          'X-API-KEY': apiKey,
        },
      },
    );

    // 2. Sign the message
    const hashedMessage = EthCrypto.hash.keccak256(message);
    const signature = EthCrypto.sign(participants[1].credentials.clientAuthPrivKey, hashedMessage);

    const signerEncryptedSeed = await EthCrypto.encryptWithPublicKey(
      participants[1].credentials.wallabyAuthPubKey,
      participants[1].credentials.seedphrase,
    );

    const payload = {
      pendingMultisigTransactionID: '27075b28-21bf-4f6c-b82d-f9761fbaa119',
      signerEncryptedSeed,
    };

    console.log(payload);

    // 3. Initiate multisig transfer the signature to the server to sign in
    const response = await http.post(
      `/transactions/sign-multisig-request`,
      {
        clientAuthPubKey: participants[1].credentials.clientAuthPubKey,
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

    console.log(response);

    logExampleOutput({
      name: 'multisig-append-signature',
      data: {
        participants,
        assets,
      },
    });
  } catch (error) {
    console.log(error?.response || error?.message);
  }
};

signOnMultisigRequest();
