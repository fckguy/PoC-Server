import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import EthCrypto from 'eth-crypto-js';
import { AppModule } from '@root/app.module';
import { testApiKey } from '@test/data/constants';
import {
  createTestWallet,
  generateAccountData,
  GenerateAccountDataI,
  generateTestClientJWTToken,
  signupTestUser,
} from '@test/data/generateAccountData';
import { registerAppGlobals } from '@helpers/registerAppGlobals';
import { AuthResponseDto } from '@modules/auth/auth.dto';

describe('wallet.controller (e2e)', () => {
  let app: INestApplication;
  let userData: GenerateAccountDataI;
  let signupResponse: AuthResponseDto;
  let clientJWTToken: string;
  const nonExistentWalletId = 'a38dd27f-1248-45b0-bf0e-c8fada8468f9';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await registerAppGlobals(app);
    await app.init();

    userData = generateAccountData();
    clientJWTToken = generateTestClientJWTToken({
      externalUserId: userData.externalUserId,
      expiresIn: '1d',
    });

    const res = await signupTestUser({ userData, app });

    signupResponse = res.signupResponse;
  });

  describe('POST /api/v1/wallets/create - Create a wallet', () => {
    it('should return unknow public key', async () => {
      const identity = EthCrypto.createIdentity();
      const resMessage = await request(app.getHttpServer())
        .post(`/api/v1/auth/signature-message`)
        .set('X-API-KEY', testApiKey)
        .set('X-CLIENT-JWT', clientJWTToken)
        .send({
          clientAuthPubKey: identity.publicKey,
        });

      const { message } = resMessage?.body;

      const hashedMessage = EthCrypto.hash.keccak256(message);
      const signature = EthCrypto.sign(identity.privateKey, hashedMessage);

      const res = await request(app.getHttpServer())
        .post(`/api/v1/wallets/create`)
        .set('X-API-KEY', testApiKey)
        .set('X-CLIENT-JWT', clientJWTToken)
        .set('Authorization', `Bearer ${signupResponse.accessToken}`)
        .send({
          clientAuthPubKey: identity.publicKey,
          signature,
          message,
        });

      expect(res.statusCode).toBe(401);
    });

    it('should return created wallet', async () => {
      const resMessage = await request(app.getHttpServer())
        .post(`/api/v1/auth/signature-message`)
        .set('X-API-KEY', testApiKey)
        .set('X-CLIENT-JWT', clientJWTToken)
        .send({
          clientAuthPubKey: userData.clientAuthPubKey,
        });

      const { message } = resMessage?.body;

      const hashedMessage = EthCrypto.hash.keccak256(message);
      const signature = EthCrypto.sign(userData.clientAuthPrivKey, hashedMessage);

      const res = await request(app.getHttpServer())
        .post(`/api/v1/wallets/create`)
        .set('X-API-KEY', testApiKey)
        .set('X-CLIENT-JWT', clientJWTToken)
        .set('Authorization', `Bearer ${signupResponse.accessToken}`)
        .send({
          clientAuthPubKey: userData.clientAuthPubKey,
          signature,
          message,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('wallet');
      expect(res.body).toHaveProperty('assets');
    });
  });

  describe.skip('POST /api/v1/wallets/create-multisig-asset - Create a multisig wallet', () => {
    it('should return created multisig wallet', async () => {
      expect.assertions(4);
      const assetSymbol = 'NOTE';
      const tokenType = 'ALGO_APP';
      const userData1 = generateAccountData();
      const userData2 = generateAccountData();

      const [account1, account2] = await Promise.all([
        await createTestWallet({ app, userData: userData1 }),
        await createTestWallet({ app, userData: userData2 }),
      ]);

      const assetAccount1 = account1.createWalletResponse.assets.find(
        (asset) => asset.assetSymbol.toLowerCase() === assetSymbol.toLowerCase(),
      );
      const assetAccount2 = account2.createWalletResponse.assets.find(
        (asset) => asset.assetSymbol.toLowerCase() === assetSymbol.toLowerCase(),
      );

      const clientJWTToken1 = generateTestClientJWTToken({
        externalUserId: userData1.externalUserId,
        expiresIn: '1d',
      });
      const resMessage = await request(app.getHttpServer())
        .post(`/api/v1/auth/signature-message`)
        .set('X-API-KEY', testApiKey)
        .set('X-CLIENT-JWT', clientJWTToken1)
        .send({
          clientAuthPubKey: userData1.clientAuthPubKey,
        });

      const { message } = resMessage?.body;

      const hashedMessage = EthCrypto.hash.keccak256(message);
      const signature = EthCrypto.sign(userData1.clientAuthPrivKey, hashedMessage);

      const res = await request(app.getHttpServer())
        .post(`/api/v1/wallets/create-multisig-asset`)
        .set('X-API-KEY', testApiKey)
        .set('X-CLIENT-JWT', clientJWTToken1)
        .set('Authorization', `Bearer ${account1.signupResponse.accessToken}`)
        .send({
          assetSymbol,
          tokenType,
          version: 1,
          threshold: 2,
          creatorAddress: assetAccount1.defaultAddress,
          participants: [assetAccount1.defaultAddress, assetAccount2.defaultAddress],
          clientAuthPubKey: userData1.clientAuthPubKey,
          signature,
          message,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('asset');
      expect(res.body).toHaveProperty('assetConfig');
      expect(res.body.asset.assetSymbol).toBe(assetSymbol);
    });
  });

  describe('GET /api/v1/wallets/:walletId/assets', () => {
    it('should return wallet not foud', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/wallets/${nonExistentWalletId}/assets`)
        .set('X-API-KEY', testApiKey)
        .set('X-CLIENT-JWT', clientJWTToken)
        .set('Authorization', `Bearer ${signupResponse.accessToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Wallet not found');
    });

    it('should return newly created wallet assets', async () => {
      const resMessage = await request(app.getHttpServer())
        .post(`/api/v1/auth/signature-message`)
        .set('X-API-KEY', testApiKey)
        .set('X-CLIENT-JWT', clientJWTToken)
        .send({
          clientAuthPubKey: userData.clientAuthPubKey,
        });

      const { message } = resMessage?.body;

      const hashedMessage = EthCrypto.hash.keccak256(message);
      const signature = EthCrypto.sign(userData.clientAuthPrivKey, hashedMessage);

      const resWallet = await request(app.getHttpServer())
        .post(`/api/v1/wallets/create`)
        .set('X-API-KEY', testApiKey)
        .set('X-CLIENT-JWT', clientJWTToken)
        .set('Authorization', `Bearer ${signupResponse.accessToken}`)
        .send({
          clientAuthPubKey: userData.clientAuthPubKey,
          signature,
          message,
        });
      const wallet = resWallet.body.wallet;

      const res = await request(app.getHttpServer())
        .get(`/api/v1/wallets/${wallet.id}/assets`)
        .set('X-API-KEY', testApiKey)
        .set('X-CLIENT-JWT', clientJWTToken)
        .set('Authorization', `Bearer ${signupResponse.accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('assets');
    });
  });

  describe('POST /api/v1/wallets/recover/init', () => {
    it('should return return the signatureMessage', async () => {
      const newUserData = generateAccountData();
      clientJWTToken = generateTestClientJWTToken({
        externalUserId: newUserData.externalUserId,
        expiresIn: '1d',
      });

      const { signupResponse } = await signupTestUser({ userData: newUserData, app });

      const newClientAuthKeys = EthCrypto.createIdentity();

      const res = await request(app.getHttpServer())
        .post(`/api/v1/wallets/recover/init`)
        .set('X-API-KEY', testApiKey)
        .set('X-CLIENT-JWT', clientJWTToken)
        .set('Authorization', `Bearer ${signupResponse.accessToken}`)
        .send({
          clientAuthPubKey: newClientAuthKeys.publicKey,
          externalUserId: newUserData.externalUserId,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('signatureMessage');
    });
  });
});
