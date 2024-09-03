const EthCrypto = require('eth-crypto-js');
const { v4 } = require('uuid');
const { logExampleOutput } = require('./helpers/logExampleOutput');
const { http } = require('./helpers/http');
const { apiKey, localApiKey } = require('./helpers/apiKeys');
const { SuiClient } = require('@mysten/sui/client');
const { fromB64 } = require('@mysten/sui/utils');
const { Ed25519Keypair } = require('@mysten/sui/keypairs/ed25519');
const seedConversion = async () => {
  try {
    // API KEY needed to access any endpoint
    const credentials = {
      clientAuthPubKey: 'eb9753d115c36e363ac5b2a3f13a9d1bbdefe01f878876663aea9d50928f1af51ec0478a7c867d63fc2dad93ebc1295ea45896638b6f9d9025c638b6b3992027',
      clientAuthPrivKey: '0xb84ce138cbc92db93e9b0eb197fa4f269f8c0f0e8d8d82cdb9873cad319c92b7',
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNTIyNTUyYTQtMjNlMy00NTFjLTljZTktMzM3YWY5NTBjYjAyIn0sInN1YiI6IjUyMjU1MmE0LTIzZTMtNDUxYy05Y2U5LTMzN2FmOTUwY2IwMiIsImlhdCI6MTY3NDYzNjQyMH0.5H8edeF0V8DYt5S3aim2y5FlKjb1LvsdBrbfqd0bsqY',
      seedphrase: 'another keep remember tobacco cinnamon apology into luggage current wild unit true theory update comfort risk bamboo alpha bachelor march pistol blouse lamp answer',
      encryptedSeedphrase: {
        iv: '8af6f5cc84c41c843c94164d38e6b37a',
        ephemPublicKey: '04af3e40c1f0d68e6431f1f5e4bc59338df696fc2f9974f3a92f7446f2533fb38240037e4ae7e9e1cf6e7a82dd26b85152c44822129ebd7567af9645f57a5a1402',
        ciphertext: '366a9cc668d7e06f5d5e989fb95cc9a81676f49ffcda3bc2e8785935700a2d670fe9fb99963a520f847ed9f45bf5e79ed60cc9fce91bc857d7f42dd50dd7b2d9ed83509b70f380eda6cd0e0f4189cbba068c2515a57848afb3b52cbda1dc59b46ccbc4f578e111e86d3da696ab989dc154dd0db2df7ff5c868869de03d59d728ff190a4b979e7920cd56a4f9627477d197aa17cb91f80e4bcc7930b3ba29c3084b0ba9bfc8f9154739e3e0158914237e',
        mac: '02da597b1e7ba2b06154842dda09f5311efb4d35dfecff00d597bdb00143394d',
      },
      wallabyAuthPubKey: '19237654afc765e28123c7f0580ea3f89284ed7554525698a5bca4e77ba045e3e3d37dfd0c0b69f9ade671213f720be2b843145b3a5f2bf8e700dc61c9776873',
    };

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
          'X-API-KEY': localApiKey,
        },
      }
    );

    // 2. Sign the message
    const hashedMessage = EthCrypto.hash.keccak256(message);
    const signature = EthCrypto.sign(credentials.clientAuthPrivKey, hashedMessage);

    const encryptedSeed = await EthCrypto.encryptWithPublicKey(credentials.wallabyAuthPubKey, credentials.seedphrase);

    const payload = {
      reference: v4(),
      encryptedSeed,
    };

    // 3. Initiate mnemonic seed conversion
    const {
      data: { reference, convertedEncryptedSeed },
    } = await http.post(
      `/wallets/convert-mnemonic-seed`,
      {
        clientAuthPubKey: credentials.clientAuthPubKey,
        signature,
        message,
        ...payload,
      },
      {
        headers: {
          'X-API-KEY': localApiKey,
        },
      }
    );

    const decryptedConvertedSeed = await EthCrypto.decryptWithPrivateKey(
      credentials.clientAuthPrivKey,
      convertedEncryptedSeed
    );

    logExampleOutput({
      name: 'seed-conversion',
      data: {
        reference,
        convertedEncryptedSeed,
        decryptedConvertedSeed,
      },
    });

    // Sui functionality
    const suiClient = new SuiClient();
    const keypair = Ed25519Keypair.fromSecretKey(fromB64(decryptedConvertedSeed));

    // Example: Create a new Sui transaction
    const transaction = {
      sender: keypair.getPublicKey().toBase64(),
      recipient: 'recipient_address_here',
      amount: 1000, // Amount in SUI
    };

    const signedTransaction = suiClient.signTransaction(transaction, keypair);
    const result = await suiClient.sendTransaction(signedTransaction);

    logExampleOutput({
      name: 'sui-transaction',
      data: {
        transaction,
        result,
      },
    });

  } catch (error) {
    console.log(error?.response || error?.message);
  }
};

seedConversion();
