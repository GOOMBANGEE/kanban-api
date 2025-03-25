import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { envKey } from 'src/common/const/env.const';
import { ConfigService } from '@nestjs/config';
import { JwtUserInfo } from '../decorator/user.decorator';
import { CacheTokenUtil } from '../util/cache-token.util';

// @UseGuards(AccessGuard) => AccessStrategy return payload: Request
@Injectable()
export class AccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor(
    private readonly configService: ConfigService,
    private readonly cacheTokenUtil: CacheTokenUtil,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get(envKey.accessTokenSecret),
    });
  }

  async validate(payload: JwtUserInfo) {
    const cacheKey = `accessToken:${payload.id}`;
    return await this.cacheTokenUtil.cacheToken(payload, cacheKey);
  }
}
