import 'dotenv/config';
import { INestApplication, RequestMethod, UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as Sentry from '@sentry/node';
import cors from 'cors';
import { isDevelopment, isTest, whitelistedOrigins } from '@constants/env';
import logger from './logger';
import { objectMask } from './objectMask';
import { ResponseInterceptor } from '@interceptors/response.interceptor';
import { ErrorResponseCodes } from '@constants/errorResponseCodes';
import { verifyOrigins } from './verifyOrigins';
import { DatabaseSource } from '@database/database-source';
import { ApiKeyOrigin } from '@modules/api-key/api-key-origin.entity';

const { APP_NAME = 'NCW Wallets Service', APP_VERSION = '1.0', NODE_ENV, SENTRY_DSN } = process.env;

export async function registerAppGlobals(app: INestApplication) {
  if (!DatabaseSource.isInitialized) {
    await DatabaseSource.initialize();
  }
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.setGlobalPrefix('api/v1', {
    exclude: [{ path: '/', method: RequestMethod.GET }],
  });

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [`'self'`],
          styleSrc: [`'self'`, `'unsafe-inline'`],
          imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
          scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
        },
      },
    }),
  );

  app.useGlobalInterceptors(new ResponseInterceptor());

  const options = new DocumentBuilder()
    .setTitle(APP_NAME)
    .setDescription(`The ${APP_NAME} is an API that manages the wallets of the Republic Crypto`)
    .setVersion(APP_VERSION)
    .addTag('NCW-Wallet-API')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'jwt-access-token',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-KEY',
        in: 'header',
        description: 'Enter the merchant API Key',
      },
      'api-key-auth',
    )
    .addSecurityRequirements('api-key-auth')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: {
      operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
      defaultModelRendering: 'model',
    },
  });

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: `ncw-api-${APP_NAME || NODE_ENV}`.replace(/\s+/g, '-').toLowerCase(),
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
    // Called for message and error events
    beforeSend(event) {
      if (event?.request?.headers) {
        event.request.headers = objectMask(event.request.headers || {}, [
          'x-api-key',
          'x-client-jwt',
          'cookie',
          'authorization',
        ]) as { [key: string]: string };
      }
      return event;
    },
  });

  app.use(Sentry.Handlers.requestHandler());

  // This will set the request origin to the value of the x-app-origin header.
  // In the case of a react native app for example, origin concept does not exist so we're sending it in a custom header
  let customOrigin = '';
  app.use((req, res, next) => {
    customOrigin = req.headers.origin ?? req.headers['x-app-origin']; // TODO: Reimplement this for the mobile app origin validation
    next();
  });

  app.use(
    cors(async (req, callback) => {
      const mobileOriginHost = req.header('x-app-origin') || req.headers['x-app-origin'];

      const originHost = req.header('origin') || req.header('Origin');

      logger.info(`cors request from: ${originHost || ''}`, {
        originHeaderLower: req.header('origin'),
        originHeaderUpper: req.header('Origin'),
        mobileOriginHost: req.header('x-app-origin')?.slice(0, 3),
      });

      const origins = [...whitelistedOrigins];

      try {
        // Check if the request is coming from a mobile app
        if (mobileOriginHost) {
          const foundApiKeyOrigin = await DatabaseSource.getRepository(ApiKeyOrigin).findOne({
            relations: ['apiKey'],
            where: { origin: mobileOriginHost },
          });

          if (foundApiKeyOrigin?.apiKey?.allowMobileAccess) {
            return callback(null, true);
          }
        }

        const apiKeyOrigins = await DatabaseSource.getRepository(ApiKeyOrigin).find({
          relations: ['apiKey'],
          select: ['id', 'origin'],
        });

        origins.push(...apiKeyOrigins.map((item) => item.origin));
        // const origins = whitelistedOrigins;
        // Allow cross-origin on development or test environment
        if (isDevelopment || isTest) {
          return callback(null, true);
        }

        if (verifyOrigins({ origins, originHost: originHost || customOrigin })) {
          return callback(null, true);
        }

        logger.warn(`blocked cors for: ${originHost || ''}`, {
          origin,
          origins,
          mobileOriginHost,
          headers: objectMask(req?.headers || {}, ['x-api-key', 'x-client-jwt', 'cookie', 'authorization']),
        });
        return callback(
          new UnauthorizedException({
            errorCode: ErrorResponseCodes.auth_origin_not_allowed,
            message: `${originHost || 'The origin'} is not allowed by CORS`,
          }),
        );
      } catch (error) {
        logger.error(`Origin validation failed ${error.message}`, {
          error,
          originHost,
          origins,
          mobileOriginHost,
          headers: objectMask(req?.headers || {}, ['x-api-key', 'x-client-jwt', 'cookie', 'authorization']),
        });
        return callback(
          new UnauthorizedException({
            errorCode: ErrorResponseCodes.auth_origin_not_allowed,
            message: `${originHost || 'The origin'} is not allowed by CORS`,
          }),
        );
      }
    }),
  );
}
