import { ExecutionContext, Injectable, NestInterceptor, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as Sentry from '@sentry/minimal';
import logger from '@helpers/logger';
import { isTest } from '@constants/env';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(null, (exception) => {
        // Ignore handled exceptions with a status code
        if (
          ([400, 401, 404].includes(exception?.status) &&
            !exception?.message?.toLowerCase().includes('internal server error')) ||
          isTest
        )
          return;

        logger.error(`${exception?.message} ${exception?.stack || ''}`.trim(), {
          exception,
          stack: exception?.stack,
        });

        Sentry.captureException(exception);
      }),
    );
  }
}
