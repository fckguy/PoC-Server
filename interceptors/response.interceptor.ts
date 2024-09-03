import logger from '@helpers/logger';
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((res: unknown) => this.responseHandler(res, context)),
      catchError((err: HttpException) => throwError(() => this.errorHandler(err, context))),
    );
  }

  errorHandler(exception: HttpException, context: ExecutionContext) {
    try {
      const ctx = context.switchToHttp();
      const response = ctx.getResponse();

      const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

      if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
        logger.error(`errorHanler: ${exception}`, {
          exception,
        });
      }
      const responsePayload: any = exception?.getResponse ? exception?.getResponse() : {};
      const payload = {
        statusCode: status,
        message: exception.message,
        ...responsePayload,
      };

      response.status(status).json(payload);
    } catch (error) {
      logger.error(`errorHanler: ${error.message}`, {
        error,
        exception,
      });
    }
  }

  responseHandler(res: any, context: ExecutionContext) {
    try {
      const ctx = context.switchToHttp();
      const response = ctx.getResponse();
      const statusCode = response.statusCode;

      return {
        statusCode,
        ...res,
      };
    } catch (error) {
      logger.error(`responseHandler: ${error.message}`, {
        error,
        res,
      });
    }
  }
}
