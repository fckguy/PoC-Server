import { jwtConstants } from '@constants/env';
import { ErrorResponseCodes } from '@constants/errorResponseCodes';
import { AuthTokenStatus } from '@modules/auth/auth-token.entity';
import { AuthService } from '@modules/auth/auth.service';
import { Injectable, Request, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
      passReqToCallback: true,
    });
  }

  async validate(@Request() req, payload: any) {
    const accessToken = req?.headers?.authorization?.split(' ')?.[1]?.trim();
    const foundAccessToken = await this.authService.findAccessToken({ accessToken });

    if (!foundAccessToken) {
      throw new UnauthorizedException({
        errorCode: ErrorResponseCodes.auth_api_jwt_invalid,
        message: 'Unauthorized JWT Access Token',
      });
    }

    if (foundAccessToken.status !== AuthTokenStatus.ACTIVE) {
      throw new UnauthorizedException({
        errorCode: ErrorResponseCodes.auth_api_jwt_invalid,
        message: 'Unauthorized Invalid JWT Access Token',
      });
    }

    return payload.user;
  }
}
