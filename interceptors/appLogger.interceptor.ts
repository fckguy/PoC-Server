import { Response, NextFunction } from 'express';
import { logger } from '@helpers/logger';
import { ApiKey, ApiKeyRepository } from '@modules/api-key/api-key.entity';
import { RequestLog, RequestLogRepository } from '@modules/request-log/request-log.entity';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomRequest } from '@root/types/CustomRequest';
import { objectMask } from '@helpers/objectMask';
import dayjs from 'dayjs';

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(ApiKey) private readonly apiKeyRepository: ApiKeyRepository,
    @InjectRepository(RequestLog) private readonly requestLogRepository: RequestLogRepository,
  ) {}
  async use(request: CustomRequest, response: Response, next: NextFunction): Promise<void> {
    const { method, originalUrl: url, body, hostname, headers } = request;
    const userAgent = request.get('user-agent') || '';
    const apiKey = request.headers['x-api-key'] as string;
    const startDateTime = dayjs();

    const foundApiKey = await this.apiKeyRepository.findOne({
      where: {
        apiKey,
      },
    });

    if (foundApiKey) {
      this.requestLogRepository.save({
        apiAppName: foundApiKey?.appName,
        apiKeyId: foundApiKey?.id,
        url,
        method,
      });

      this.apiKeyRepository.increment({ id: foundApiKey.id }, 'requestsCount', 1); // foundApiKey.requestsCount = foundApiKey.requestsCount + 1;
      this.apiKeyRepository.increment({ id: foundApiKey.id }, 'totalRequestSizeInKb', 1); // foundApiKey.totalrequestsCount = foundApiKey.totalrequestsCount + 1;
      this.apiKeyRepository.update({ id: foundApiKey.id }, { lastRequestAt: new Date() });
    }

    const send = response.send;
    response.send = (responseString) => {
      try {
        const { statusCode } = response;
        const responseTime = dayjs().diff(startDateTime, 'millisecond');

        let responseData;

        try {
          responseData = JSON.parse(responseString);
        } catch (error) {
          logger.error(`failed to parse response data: ${error.message} ${error.stack}`, {
            error,
            url,
          });
        }

        const contentLength = response?.getHeader('content-length') || responseString?.length || 0;

        const message = `${method} ${url} - ${statusCode} [${responseTime}ms] [${contentLength} bytes] ${userAgent}`;

        if (url.toLowerCase().includes('/api/v1/assets/configurations')) {
          logger.info('configurations logs => 1', {
            url,
          });
        }

        const messagePayload = {
          url,
          requestMethod: method,
          requestQuery: objectMask(request.query || {}, []),
          requstHostname: hostname,
          requestHeaders: objectMask(headers || {}, ['x-api-key', 'x-client-jwt', 'cookie', 'authorization']),
          requestBody: objectMask(body || {}, ['password', 'secret', 'accessToken', 'email', 'lastName']),
          responseTime,
          responseBody: {
            statusCode,
            ...objectMask(responseData || {}, ['password', 'secret', 'accessToken', 'email', 'lastName']),
          },
        };

        if (statusCode >= 400) {
          logger.error(message, messagePayload);
        } else {
          logger.info(message, messagePayload);
        }

        logger.info('configurations logs => 2', {
          url,
          requestMethod: method,
          requestQuery: objectMask(request.query || {}, []),
          requstHostname: hostname,
          requestHeaders: objectMask(headers || {}, ['x-api-key', 'x-client-jwt', 'cookie', 'authorization']),
          requestBody: objectMask(body || {}, ['password', 'secret', 'accessToken', 'email', 'lastName']),
          responseTime,
        });
        response.send = send;
        return response.send(responseString);
      } catch (error) {
        logger.error(`AppLoggerMiddleware error: ${error.message} stack:${error?.stack}`, { error });
      }
    };

    next();
  }
}
