import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { envKey } from 'src/common/const/env.const';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import {
  USER_ERROR,
  UserException,
} from '../../common/exception/user.exception';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtUserInfo } from '../decorator/user.decorator';

// @UseGuards(RefreshGuard) => RefreshStrategy return payload: Request
@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
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
    const cache = await this.cacheManager.get(cacheKey);

    if (cache) {
      return cache;
    }

    // payload.exp = second
    const expiresIn = payload.exp * 1000;
    const now = Date.now(); // milliSecond
    const differenceInMilliseconds = expiresIn - now - 3000;

    const ttl = Math.max(differenceInMilliseconds, 1);
    await this.cacheManager.set(cacheKey, payload, ttl);

    return payload;
  }
}
