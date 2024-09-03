import { Module, CacheModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

import * as Joi from 'joi';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';

import { QueryModule } from '@modules/query/query.module';
import { TransactionsModule } from '@modules/transactions/transactions.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WalletModule } from './modules/wallet/wallet.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthPublicKeyService } from './modules/auth-public-key/auth-public-key.service';
import { AuthPublicKeyModule } from './modules/auth-public-key/auth-public-key.module';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './modules/user/user.module';
import { AssetModule } from './modules/asset/asset.module';
import { ChainModule } from './modules/chain/chain.module';
import { AppLoggerMiddleware } from '@interceptors/appLogger.interceptor';
import { ApiKeyService } from './modules/api-key/api-key.service';
import { ApiKeyModule } from './modules/api-key/api-key.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKey } from '@modules/api-key/api-key.entity';
import { RequestLogModule } from './modules/request-log/request-log.module';
import { RequestLog } from '@modules/request-log/request-log.entity';
import { User } from '@modules/user/user.entity';
import { MerchantModule } from './modules/merchant/merchant.module';
import { VerifyApiKeyGuard } from '@guards/verifyApiKey.guard';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { UserActivityModule } from './modules/user-activity/user-activity.module';
import { UserActivityInterceptor } from '@interceptors/activity.interceptor';
import { UserActivity } from '@modules/user-activity/user-activity.entity';

const redisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
};
@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      ...redisOptions,
    }),
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        PORT: Joi.number(),
        NODE_ENV: Joi.string().valid('test', 'development', 'staging', 'production').required(),
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),

        REDIS_HOST: Joi.string(),
        REDIS_PORT: Joi.number(),

        RATE_LIMIT_TTL_SECONDS: Joi.number()
          .min(1)
          .max(60 * 10),
        RATE_LIMIT_MAXIMUM_REQUESTS: Joi.number().min(5).max(100),

        ALGO_RPC_API_TOKEN: Joi.string(),

        JWT_SECRET: Joi.string().min(256),
      }),
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: Number(config.get('RATE_LIMIT_TTL_SECONDS') || 1),
        limit: Number(config.get('RATE_LIMIT_MAXIMUM_REQUESTS') || 10),
        storage: new ThrottlerStorageRedisService(`redis://${redisOptions.host}:${redisOptions.port}`),
      }),
    }),
    TypeOrmModule.forFeature([ApiKey, RequestLog, User, UserActivity]),
    DatabaseModule,
    ChainModule,
    AssetModule,
    MerchantModule,
    AuthModule,
    WalletModule,
    AuthPublicKeyModule,
    UserModule,
    QueryModule,
    TransactionsModule,
    ScheduleModule.forRoot(),
    ApiKeyModule,
    RequestLogModule,
    DashboardModule,
    UserActivityModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AuthPublicKeyService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: VerifyApiKeyGuard,
    },
    AppService,
    AuthPublicKeyService,
    ApiKeyService,
    {
      provide: APP_INTERCEPTOR,
      useClass: UserActivityInterceptor,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*'); // Log all incoming requests
  }
}
