import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { envKey } from 'src/common/const/env.const';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import {
  USER_ERROR,
  UserException,
} from '../../common/exception/user.exception';
import { JwtUserInfo } from '../decorator/user.decorator';
import { CacheTokenUtil } from '../util/cache-token.util';

// @UseGuards(RefreshGuard) => RefreshStrategy return payload: Request
@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly configService: ConfigService,
    private readonly cacheTokenUtil: CacheTokenUtil,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          if (!req.headers.cookie) {
            throw new UserException(USER_ERROR.REFRESH_TOKEN_INVALID);
          }

          return req.headers.cookie.split('refreshToken=')[1]; // 쿠키에서 refreshToken 가져옴
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get(envKey.refreshTokenSecret),
    });
  }

  async validate(payload: JwtUserInfo) {
    const cacheKey = `refreshToken:${payload.id}`;
    return await this.cacheTokenUtil.cacheToken(payload, cacheKey);
  }
}
