import 'dotenv/config';
import { Injectable, CanActivate, ExecutionContext, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import jwt from 'jsonwebtoken';
import { logger } from '../helpers/logger';
import { ApiKey, ApiKeyRepository, ApiKeyStatus } from '@modules/api-key/api-key.entity';
import { HEALTH_CHECK_ORIGIN, dashboardDomainNamesOrigins, isDevelopment, isTest, jwtConstants } from '@constants/env';
import { RequestLog, RequestLogRepository } from '@modules/request-log/request-log.entity';
import { User, UserRepository } from '@modules/user/user.entity';
import { CustomRequest } from '@root/types/CustomRequest';
import { objectMask } from '@helpers/objectMask';
import { ErrorResponseCodes } from '@constants/errorResponseCodes';
import { jwtWhitelistPaths } from '@constants/jwtWhitelistPaths';
import { pick } from 'lodash';

const LOG_NAME = 'AUTH_API_KEY_GUARD';

@Injectable()
export class VerifyApiKeyGuard implements CanActivate {
  constructor(
    @InjectRepository(ApiKey) private readonly apiKeyRepository: ApiKeyRepository,
    @InjectRepository(RequestLog) private readonly requestLogRepository: RequestLogRepository,
    @InjectRepository(User) private readonly userRepository: UserRepository,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const [req]: [CustomRequest] = context.getArgs();
    const apiKey = req.headers['x-api-key'] as string;
    const clientJWT = req.headers['x-client-jwt'] as string;
    const mobileOrigin = req.headers['x-app-origin'] as string;

    const userAgent = req?.get('user-agent') || '';
    const { body } = req;

    const { origin } = req?.headers || {};

    const ignoreExternalUserIdVerificationPaths = [
      '/api/v1/auth/signature-message/external',
      '/api/v1/auth/sign-up/external',
    ];

    const ignoreDashboardAuthOriginsPaths = [
      '/api/v1/auth/emails/send-otp',
      '/api/v1/auth/emails/sign-in',
      '/api/v1/auth/reset-password',
    ];

    // Allow the health check endpoint
    if (req?.url === '/' && userAgent.includes(HEALTH_CHECK_ORIGIN)) {
      return true;
    }

    if (!apiKey) {
      const message = 'API Key is required in the header';
      logger.error(message, {
        LOG_NAME,
        headers: objectMask(req.headers || {}, ['x-api-key', 'x-client-jwt', 'cookie', 'authorization']),
        origin,
        url: req?.url,
      });
      throw new BadRequestException({
        errorCode: ErrorResponseCodes.auth_api_key_not_provided,
        message,
      });
    }

    const foundApiKey = await this.apiKeyRepository.findOne({
      relations: ['merchant', 'origins'],
      where: {
        apiKey,
      },
    });

    if (!foundApiKey) {
      const message = `Unauthorized API Key`;
      logger.error(message, {
        LOG_NAME,
        headers: objectMask(req.headers || {}, ['x-api-key', 'x-client-jwt', 'cookie', 'authorization']),
        origin,
        url: req?.url,
      });
      throw new UnauthorizedException({
        errorCode: ErrorResponseCodes.auth_api_key_not_found,
        message,
      });
    }

    if (mobileOrigin && !foundApiKey.allowMobileAccess) {
      const message = `Mobile Origin is not allowed for the provided API Key`;
      logger.error(message, {
        LOG_NAME,
        mobileOrigin,
        headers: objectMask(req.headers || {}, ['x-api-key', 'x-client-jwt', 'cookie', 'authorization']),
        url: req?.url,
      });
    }

    if (foundApiKey?.status !== ApiKeyStatus.ACTIVE) {
      const errorMessage = `API Key is ${foundApiKey?.status}`;
      logger.error(errorMessage, {
        LOG_NAME,
        origin,
        mobileOrigin,
        headers: objectMask(req.headers || {}, ['x-api-key', 'x-client-jwt', 'cookie', 'authorization']),
        url: req?.url,
      });
      throw new UnauthorizedException({
        errorCode: ErrorResponseCodes.auth_api_key_not_active,
        message: errorMessage,
      });
    }

    // Allow the health check endpoint after the API Key check
    if (req?.url === '/') {
      return true;
    }

    const { ip } = req;

    if (
      !isTest &&
      !isDevelopment && // Ignore develop environment origin check
      !foundApiKey.hasOrigin({
        origin: foundApiKey.allowMobileAccess ? mobileOrigin || origin : origin,
        ipAddress: ip,
      })
    ) {
      const errorMessage = `The ${origin || ''} origin is not allowed`;
      logger.error(errorMessage, {
        LOG_NAME,
        origin,
        mobileOrigin,
        foundApiKey: pick(foundApiKey, ['id', 'apiKey', 'allowMobileAccess', 'onlyDashboardAccess']),
      });
      throw new UnauthorizedException({
        message: errorMessage,
        errorCode: ErrorResponseCodes.auth_origin_not_allowed,
      });
    }

    const isDashboardOrigin =
      (foundApiKey.hasOrigin({ origin }) || dashboardDomainNamesOrigins.includes(origin) || (!origin && isTest)) &&
      foundApiKey.onlyDashboardAccess;

    if (isDashboardOrigin && ignoreDashboardAuthOriginsPaths.indexOf(req?.path) !== -1) {
      return true;
    }

    const secret = isDashboardOrigin ? jwtConstants.secret : foundApiKey.clientJWTPubKey;

    /**
     * Verify Client JWT Token
     */
    if (!secret) {
      const errorMessage = `The client JWT Public Key hasn't been set, please contact the administrator`;
      logger.error(errorMessage, {
        LOG_NAME,
        apiKey,
        ip,
        origin,
      });
      throw new BadRequestException({
        errorCode: ErrorResponseCodes.auth_api_key_pub_key_not_set,
        message: errorMessage,
      });
    }

    if (!clientJWT) {
      throw new UnauthorizedException({
        errorCode: ErrorResponseCodes.auth_client_jwt_not_provided,
        message: 'Client JWT is required in the header',
      });
    }

    // Allow some paths without client JWT
    if (jwtWhitelistPaths.indexOf(req?.path) !== -1 && !clientJWT) {
      return true;
    }

    try {
      const decoded = jwt.verify(clientJWT, secret) as null | Record<string, string>;

      if (!decoded) {
        throw new UnauthorizedException({
          errorCode: ErrorResponseCodes.auth_client_jwt_invalid,
          message: `Invalid client JWT was provided`,
        });
      }

      // Ignore externalUserId verification for some paths
      if (!decoded?.externalUserId && ignoreExternalUserIdVerificationPaths.indexOf(req?.path) === -1) {
        throw new UnauthorizedException({
          errorCode: ErrorResponseCodes.auth_client_jwt_missing_external_id_payload,
          message: `The client JWT doesn't have externalUserId in the payload`,
        });
      }

      if (!decoded.exp) {
        throw new UnauthorizedException({
          errorCode: ErrorResponseCodes.auth_client_jwt_missing_exp_payload,
          message: `The client JWT expiration date wasn't set correctly`,
        });
      }

      if (body?.externalUserId && decoded?.externalUserId.toLowerCase() !== body?.externalUserId?.toLowerCase()) {
        // Check if the externalUserId matches the client externalUserId
        throw new UnauthorizedException({
          errorCode: ErrorResponseCodes.auth_client_jwt_external_id_not_match,
          message: `The client JWT externalUserId doesn't match the provided externalUserId in the request`,
        });
      }

      const user = await this.userRepository.findOne({
        where: {
          externalUserId: decoded.externalUserId,
        },
      });

      req.user = user || null;

      req.apiKey = foundApiKey;

      return true;
    } catch (error) {
      let message = error?.message || error?.name;
      let errorCode = ErrorResponseCodes.auth_client_jwt_invalid;

      if (error instanceof jwt.TokenExpiredError) {
        message = `The client JWT has expired`;
        errorCode = ErrorResponseCodes.auth_client_jwt_expired;
      }

      logger.error(message, {
        error,
        LOG_NAME,
        apiKey,
        ip,
        body,
        origin,
      });
      throw new UnauthorizedException({
        errorCode,
        message,
      });
    }
  }
}
