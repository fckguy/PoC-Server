const EthCrypto = require('eth-crypto-js');
const { v4 } = require('uuid');
const { generateClientJWTToken } = require('./helpers/generateClientJWTToken');
const { logExampleOutput } = require('./helpers/logExampleOutput');
const { http } = require('./helpers/http');

const createAllowanceTransaction = async () => {
  try {
    const apiKey = '071b51027b264a1b8fcd3d73684d25ca';

    const ownerCredentials = {
      address: '0x8A6161ee52428EE327b8afdFa8D2382beaA861F1',
      wallabyAuthPubKey:
        'b22d41d17762a2394e36ba2ba4eb7e12c1ac17d353b6beafaf24b4c79243ff9a6b9a3da601714a5ce4578cee9a8e634f6123574ae65bf43253c0a3eafb55e8f7',

      clientAuthPubKey:
        '0ca22d81a33711f53015ada7ca2fdd2aa2abd3ba849c90b7309ff7455c60690aedce18b455bc1010ef431b56d962b58dfce2f384389d63f250b5c220915e9fd9',
      clientAuthPrivKey: '0xa04ff9e003f635c9f33938c31607f4bc6ef58217fe1be4cd0b7ba4f4861b8fba',
      accessToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiY2JkNWY5NzAtMDFhYi00MTkxLWIzNTgtYTVkNzAyZmMzMDRhIiwiZXh0ZXJuYWxVc2VySWQiOiI3MzBkNTRlMy1jMTJkLTQ5ZDEtYjBlOC0yMThhMGZlODIyMGQiLCJtZXJjaGFudElkIjpudWxsfSwic3ViIjoiY2JkNWY5NzAtMDFhYi00MTkxLWIzNTgtYTVkNzAyZmMzMDRhIiwiaWF0IjoxNzA2MDUxNDQwLCJleHAiOjE3MDYxMzc4NDB9.tnENfZYEXX2KQDTEm9diuv5J4vYAck-T9YzjKoEwYSo',
      seedphrase:
        'snow able siege tube own normal tip code resource bronze wrong version issue until transfer milk together toilet middle zone hobby length dune stomach',
      encryptedSeedphrase: {
        iv: '086e6f7c4194d48fc0b9ceee7a3f1cde',
        ephemPublicKey:
          '041a4bbf6ea5fe85e3bcb5c5ca48e6c77cf9fa9c3f399411b59bd8c9d5ebb697c22c3a79190c168f799777cb1aed34badc4c08b2f070bff23d374af2d6922936cd',
        ciphertext:
          '2fc42fd3ec40961893a7d7275da5d456136c9a076d2be21a3948a1cdc8481b846883d05215a630ccd79e8364d641052cc0417da82743ccb0329d6157d6a43a0374dee72704581895190be3adb56a72125caae022d6d512f7665dfc7f31e2685a50b7eea7be6d0fe9ce46b1b5756d90bfcab9a8c322cc3335fda988f7b9a4933550ffd7d44021a42843da3fe3bd7ac074fbe895aa4d25fc4596c36193c14e910e',
        mac: '6ae8d13b691b5491fa8e81a888914dbcbbffb95a67e77e9b957e439ad915173f',
      },
    };

    const spenderCredentials = {
      address: '0x13fA158A117b93C27c55b8216806294a0aE88b6D',
    };

    const externalUserId = 'aba87484-d30d-4d49-bbb2-ef05e4f8e76b';
    const clientJWTToken = generateClientJWTToken(externalUserId);

    // User identifier from the republic
    // 1. Request for the message to be signed
    const {
      data: { message },
    } = await http.post(
      `/auth/signature-message`,
      {
        clientAuthPubKey: ownerCredentials.clientAuthPubKey,
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
    const signature = EthCrypto.sign(ownerCredentials.clientAuthPrivKey, hashedMessage);

    const encryptedSeed = await EthCrypto.encryptWithPublicKey(
      ownerCredentials.wallabyAuthPubKey,
      ownerCredentials.seedphrase,
    );

    const payload = {
      assetId: '5386c6c3-2342-4d5a-902b-3f386c81f2d3',
      contractAddress: '',
      ownerAddress: ownerCredentials.address,
      spenderAddress: spenderCredentials.address,
      amount: 0.0245,
      reference: v4(),
      memo: '',
      encryptedSeed,
    };

    // 3. Initiate multisig transfer the signature to the server to sign in
    const {
      data: { transaction },
    } = await http.post(
      `/transactions/create-allowance`,
      {
        clientAuthPubKey: ownerCredentials.clientAuthPubKey,
        signature,
        message,
        ...payload,
      },
      {
        headers: {
          'X-API-KEY': apiKey,
          'X-CLIENT-JWT': clientJWTToken,
          Authorization: 'Bearer ' + ownerCredentials.accessToken,
        },
      },
    );

    logExampleOutput({
      name: 'allowance-transaction',
      data: {
        transaction,
      },
    });
  } catch (error) {
    console.log(error?.response || error?.message);
  }
};

createAllowanceTransaction();
