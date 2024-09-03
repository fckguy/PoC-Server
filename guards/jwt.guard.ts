import { ErrorResponseCodes } from '@constants/errorResponseCodes';
import { ExecutionContext, Injectable, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

export const IS_PUBLIC_KEY = 'isPublic';
export const PublicAPI = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  // Override handleRequest to throw a custom exception
  handleRequest(err: any, user: any, info: any, context: any, status: any) {
    if (info?.message === 'No auth token') {
      throw new UnauthorizedException({
        errorCode: ErrorResponseCodes.auth_api_jwt_not_provided,
        message: 'Access token is required!',
      });
    }

    return super.handleRequest(err, user, info, context, status);
  }
}
