import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { envKey } from 'src/common/const/env.const';
import { ConfigService } from '@nestjs/config';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtUserInfo } from '../decorator/user.decorator';

// @UseGuards(AccessGuard) => AccessStrategy return payload: Request
@Injectable()
export class AccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get(envKey.accessTokenSecret),
    });
  }

  async validate(payload: JwtUserInfo) {
    const cacheKey = `accessToken:${payload.id}`;
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
