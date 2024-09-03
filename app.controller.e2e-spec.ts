import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '@root/app.module';
import { testApiKey } from '@test/data/constants';
import { generateTestClientJWTToken } from '@test/data/generateAccountData';

describe('app.controller (e2e)', () => {
  let app: INestApplication;
  let clientJWTToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    clientJWTToken = generateTestClientJWTToken({
      externalUserId: 'externalUserId',
      expiresIn: '1d',
    });
    await app.init();
  });

  it('/ (GET) - should return "Bad Request"', async () => {
    const res = await request(app.getHttpServer()).get('/');

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatchInlineSnapshot(`"API Key is required in the header"`);
  });

  it('/ (GET) - should return "Unauthorized" for a wrong API Key', async () => {
    const res = await request(app.getHttpServer())
      .get('/')
      .set('X-API-KEY', 'wrong-api-key')
      .set('X-CLIENT-JWT', clientJWTToken);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatchInlineSnapshot(`"Unauthorized API Key"`);
  });

  it('/ (GET) - should return "OK"', async () => {
    const res = await request(app.getHttpServer())
      .get('/')
      .set('X-API-KEY', testApiKey)
      .set('X-CLIENT-JWT', clientJWTToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatchInlineSnapshot(`"OK"`);
  });
});
