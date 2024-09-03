import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserActivity, UserActivityRepository } from '@modules/user-activity/user-activity.entity';
import { Observable, tap } from 'rxjs';
import logger from '@helpers/logger';
import * as Sentry from '@sentry/minimal';
import { isTest } from '@constants/env';
import { objectMask } from '@helpers/objectMask';

@Injectable()
export class UserActivityInterceptor implements NestInterceptor {
  constructor(@InjectRepository(UserActivity) private readonly userActityRepository: UserActivityRepository) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(() => {
        const { user, method: requestMethod, originalUrl: requestUrl, body } = context.switchToHttp().getRequest();

        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(requestMethod) && user) {
          try {
            this.userActityRepository.save({
              action: requestMethod,
              requestMethod,
              requestUrl,
              requestBody: body ? objectMask(body, ['password', 'apiKey', 'otpCode']) : null,
              userId: user.id,
              merchantId: user.merchantId || null,
            });
          } catch (error) {
            const errorMessage = `failed to record user's activity: ${error.message}`;
            logger.error(errorMessage, { error });

            if (!isTest) {
              Sentry.captureMessage(errorMessage);
            }
          }
        }
      }),
    );
  }
}
