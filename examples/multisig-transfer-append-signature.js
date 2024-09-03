const EthCrypto = require('eth-crypto-js');

const { logExampleOutput } = require('./helpers/logExampleOutput');
const { http } = require('./helpers/http');

const multisigInit = async () => {
  try {
    // API KEY needed to access any endpoint
    const apiKey = '071b51027b264a1b8fcd3d73684d25ca';

    const participants = [
      {
        credentials: {
          clientAuthPubKey:
            '49dd32adca93afbec936414f86ac5f76f3dcbaa1e1ef508ad593ce4f8daae1a9d443b15deae3322755822d783e4ec4e9d837b0dd14b639f1d944a510cdcae65e',
          clientAuthPrivKey: '0x1c6d257f05d4462ec55540a0a6763d5efb84a0e33a29d5d3f418880602fb944e',
          seedphrase:
            'indoor rebel melody problem divorce hawk assault moon outdoor carbon degree poet village more deer east drift census nerve dentist fantasy airport mesh change',
          encryptedSeedphrase: {
            iv: 'eb16285cf4856d9c9c3ea2cfc2d53723',
            ephemPublicKey:
              '045f9bf566cb9f00540461fb1a56c6a382f147ff3ea943c42ce57d57c95a2e1b7f9cac0198e5813fc99e9d7e822c6c5001d984a649c60bf843b60485cf7d097efe',
            ciphertext:
              'ca477559ccb5d8e5287a342a351ec6b878da218d7cfdedfc48eb944f87954e0eb8e03d6b12010b148dd6a108fb149d353d5f86d64659784749113efad1f74f53ffe02b160ec817ef76ea31e4f31c4640dbae22dc0adf83ccdc7b406831ade9e855cf6dbce59e6ba6259bd9938f9a3b059457b9384694b14bfc6be0812d9d1e747d35ff8091817edd1883362b1cf5459a58e11b9777ed82f1311d90bfa496a761',
            mac: '31a8dafcbd1fec287212a5f475ded839f16016c5aae25bb206eb5712831a87d2',
          },
          address: 'C4NDOJ5S247VGDJJFBVT3V7QHOLAKH7ZYZAR3WUTVA43VQEXO2HNG6BC3I',
          wallabyAuthPubKey:
            '4ecb720b1392468c75803d6252ac987c113206955070b96df1208c1c480338168e1407cec4b5af2f91d12af9b725cbd85af994b29c6364971a7ef8d955be83dc',
        },
      },
      {
        credentials: {
          clientAuthPubKey:
            '51b0145587a1ce25c7f05861388bd67c9d2a10122dab05d98b457634847f9f701d7bb12d9151b992591e5f7010221ca02d0e5a245f9a5bb923437424018f4c40',
          clientAuthPrivKey: '0xdde547c9da7971d20a233d6b65b675f3b1fa8931c6a9dd473e458e6973eb7a0f',
          seedphrase:
            'room enlist excess among breeze earn predict test retire guard zone nation vacuum light car grab catch produce lens hole benefit shuffle price damage',
          encryptedSeedphrase: {
            iv: '671d6102266ae4e68cf0e092144c0d75',
            ephemPublicKey:
              '04a51b8078edbdbbca04815927f6d3a7586ceb651d11c3f44352043e7b83e5484dfeb77206c5270da0e07527c127d32b45c925e4caf1bab27ca7053a0a9b5dd99c',
            ciphertext:
              'f29c63224521fd1969fea20294639e1f238da3dc307df78d6315cfcf473630824d1f5cbff703a065812750391ed7655378ba024ed83c021cfa34f23af4c1002de341aeda0786cc9f08e353583b7d830f0ba399ef0800688f9859f173c2a07b848de2d2e57a7e35beb6a4852d90bc781e0b1c329ce04c53a1947e5e4d6a7d7de9463939c00da470cd4808eda31477a1ca58c4b40879a04aa0da68b7998f2ef0e0',
            mac: '8895d8cd66e41afbff8d6aecd75b843061d04113d6d7e733364da5780fc4cf07',
          },
          address: '5TPHTHZO6HFIYOP7DWLFF5SYGVDK5UCLZKI2QHKXBKXRLB5M3T4ZXRWF5Y',
          wallabyAuthPubKey:
            'c061036d0836b509d1874338447924592229469b1d3c80651c007aff955fa636c5f140ff883b29530f7e11ce691ead9e181b28599de3bc259fa12396d819b76d',
        },
      },
      {
        credentials: {
          clientAuthPubKey:
            '0c2453aaeac9e3c8ca324d61fc98fd93bc1e7a7836c87ca295f72bdfdd8fcb94655de6f7a1502a8588841a0041693c5330369e0c6221681daa957f4a5f77ce46',
          clientAuthPrivKey: '0x0d75961c5e46197982232039fc21baf2add316874a47a6fcdf1eecc74fd8e0c2',
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
          wallabyAuthPubKey:
            '56f33914987dcdd38b8ae4f39d8cb0336835fe8ee5fbbbb722ec92b6b6ad2b703ba2402cd9cf69bea9bbd8cd92b722c79399e9e7a4bf91c64cec1b75130f0b0e',
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
      pendingMultisigTransactionID: '39add081-f0ff-4157-8adc-f9e6b4b06971',
      signerEncryptedSeed,
    };

    console.log(payload);

    // 3. Initiate multisig transfer the signature to the server to sign in
    const {
      data: { assets },
    } = await http.post(
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

    logExampleOutput({
      name: 'multisig-sign-transfer-request',
      data: {
        participants,
        assets,
      },
    });
  } catch (error) {
    console.log(error?.response || error?.message);
  }
};

multisigInit();
