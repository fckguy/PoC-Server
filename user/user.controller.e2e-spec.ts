import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import EthCrypto from 'eth-crypto-js';
import { AppModule } from '@root/app.module';
import { testApiKey } from '@test/data/constants';
import {
  generateAccountData,
  GenerateAccountDataI,
  generateTestClientJWTToken,
  signupTestUser,
} from '@test/data/generateAccountData';
import { registerAppGlobals } from '@helpers/registerAppGlobals';
import { AuthResponseDto } from '@modules/auth/auth.dto';

describe('user.controller (e2e)', () => {
  let app: INestApplication;
  let userData: GenerateAccountDataI;
  let signupResponse: AuthResponseDto;
  let clientJWTToken: string;
  const nonExistentUserId = 'a38dd27f-1248-45b0-bf0e-c8fada8468f9';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await registerAppGlobals(app);
    await app.init();

    userData = generateAccountData();

    const res = await signupTestUser({ userData, app });
    clientJWTToken = generateTestClientJWTToken({
      externalUserId: userData.externalUserId,
      expiresIn: '1d',
    });

    signupResponse = res.signupResponse;
  });

  describe('GET /api/v1/users/:userId - Retrieve user by primary key', () => {
    it('should return User not found', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/users/${nonExistentUserId}`)
        .set('X-API-KEY', testApiKey)
        .set('X-CLIENT-JWT', clientJWTToken)
        .set('Authorization', `Bearer ${signupResponse.accessToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatchInlineSnapshot(`"User not found"`);
    });

    it("should return user's information", async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/users/${signupResponse.user.id}`)
        .set('X-API-KEY', testApiKey)
        .set('X-CLIENT-JWT', clientJWTToken)
        .set('Authorization', `Bearer ${signupResponse.accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.user.id).toBe(signupResponse.user.id);
    });
  });

  describe('GET /api/v1/users/:externalUserId/externalUserId - Retrieve user by externalUserId', () => {
    it('should return User not found', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/users/${nonExistentUserId}/externalUserId`)
        .set('X-API-KEY', testApiKey)
        .set('X-CLIENT-JWT', clientJWTToken)
        .set('Authorization', `Bearer ${signupResponse.accessToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatchInlineSnapshot(`"User not found"`);
    });

    it("should return user's information", async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/users/${signupResponse.user.externalUserId}/externalUserId`)
        .set('X-API-KEY', testApiKey)
        .set('X-CLIENT-JWT', clientJWTToken)
        .set('Authorization', `Bearer ${signupResponse.accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.user.id).toBe(signupResponse.user.id);
      expect(res.body.user.externalUserId).toBe(signupResponse.user.externalUserId);
    });
  });

  describe("GET /api/v1/users/:userId/assets - Retrieve assets by user's primary key", () => {
    it('should return User not found', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/users/${nonExistentUserId}/assets`)
        .set('X-API-KEY', testApiKey)
        .set('X-CLIENT-JWT', clientJWTToken)
        .set('Authorization', `Bearer ${signupResponse.accessToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatchInlineSnapshot(`"User not found"`);
    });

    it("should return an array of user's assets", async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/users/${signupResponse.user.id}/assets`)
        .set('X-API-KEY', testApiKey)
        .set('X-CLIENT-JWT', clientJWTToken)
        .set('Authorization', `Bearer ${signupResponse.accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('assets');
    });
  });

  describe("GET /api/v1/users/:userId/wallets - Retrieve wallets by user's primary key", () => {
    it('should return User not found', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/users/${nonExistentUserId}/wallets`)
        .set('X-API-KEY', testApiKey)
        .set('X-CLIENT-JWT', clientJWTToken)
        .set('Authorization', `Bearer ${signupResponse.accessToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatchInlineSnapshot(`"User not found"`);
    });

    it("should return an array of user's wallets", async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/users/${signupResponse.user.id}/wallets`)
        .set('X-API-KEY', testApiKey)
        .set('X-CLIENT-JWT', clientJWTToken)
        .set('Authorization', `Bearer ${signupResponse.accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('wallets');
    });
  });

  describe("GET /api/v1/users/:userId/multisig-transactions - Retrieve multisig-transactions by user's primary key", () => {
    it('should return User not found', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/users/${nonExistentUserId}/multisig-transactions?status=pending-approval`)
        .set('X-API-KEY', testApiKey)
        .set('X-CLIENT-JWT', clientJWTToken)
        .set('Authorization', `Bearer ${signupResponse.accessToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatchInlineSnapshot(`"User not found"`);
    });

    it("should return an array of user's multisig transactions", async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/users/${signupResponse.user.id}/multisig-transactions?status=pending-approval`)
        .set('X-API-KEY', testApiKey)
        .set('X-CLIENT-JWT', clientJWTToken)
        .set('Authorization', `Bearer ${signupResponse.accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('multisigTransactions');
    });
  });

  describe('PUT /api/v1/users/profile - Retrieve profile for the provided access token', () => {
    it('should return Nothing was update', async () => {
      const resMessage = await request(app.getHttpServer())
        .post('/api/v1/auth/signature-message')
        .set('X-API-KEY', testApiKey)
        .set('X-CLIENT-JWT', clientJWTToken)
        .send({
          clientAuthPubKey: userData.clientAuthPubKey,
        });

      const { message } = resMessage?.body;

      const hashedMessage = EthCrypto.hash.keccak256(message);
      const signature = EthCrypto.sign(userData.clientAuthPrivKey, hashedMessage);

      const res = await request(app.getHttpServer())
        .put(`/api/v1/users/profile`)
        .set('X-API-KEY', testApiKey)
        .set('X-CLIENT-JWT', clientJWTToken)
        .set('Authorization', `Bearer ${signupResponse.accessToken}`)
        .send({
          signature,
          message,
          clientAuthPubKey: userData.clientAuthPubKey,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatchInlineSnapshot(`"Nothing was updated"`);
    });

    it("should return the updated user's information", async () => {
      const firstName = 'Noham';

      const resMessage = await request(app.getHttpServer())
        .post('/api/v1/auth/signature-message')
        .set('X-API-KEY', testApiKey)
        .set('X-CLIENT-JWT', clientJWTToken)
        .send({
          clientAuthPubKey: userData.clientAuthPubKey,
        });

      const { message } = resMessage?.body;

      const hashedMessage = EthCrypto.hash.keccak256(message);
      const signature = EthCrypto.sign(userData.clientAuthPrivKey, hashedMessage);

      const res = await request(app.getHttpServer())
        .put(`/api/v1/users/profile`)
        .set('X-API-KEY', testApiKey)
        .set('X-CLIENT-JWT', clientJWTToken)
        .set('Authorization', `Bearer ${signupResponse.accessToken}`)
        .send({
          firstName,
          signature,
          message,
          clientAuthPubKey: userData.clientAuthPubKey,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.user.firstName).toEqual(firstName);
    });
  });
});
