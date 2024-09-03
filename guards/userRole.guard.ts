import {
  CanActivate,
  ExecutionContext,
  Injectable,
  applyDecorators,
  SetMetadata,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CustomRequest } from '@root/types/CustomRequest';
import { UserRole } from '@modules/user/user.entity';
import { logger } from '@helpers/logger';
import { ErrorResponseCodes } from '@constants/errorResponseCodes';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext) {
    const role = this.reflector.get<UserRole[]>('role', context.getHandler());
    const [req]: [CustomRequest] = context.getArgs();

    if (!role.includes(req?.user?.role)) {
      const message = 'You are not authorized to perform this action';

      logger.error(message, {
        role,
        user: req?.user,
      });

      throw new ForbiddenException({
        errorCode: ErrorResponseCodes.auth_user_not_allowed_to_perform_the_action,
        message,
      });
    }

    return true;
  }
}

export const UserRoleGuard = (...role: UserRole[]) =>
  applyDecorators(SetMetadata('role', [role]?.flat()), UseGuards(new RoleGuard(new Reflector())));
