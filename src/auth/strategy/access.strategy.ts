import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { envKey } from 'src/common/const/env.const';
import { ConfigService } from '@nestjs/config';

// @UseGuards(AccessGuard) => AccessStrategy return payload: Request
@Injectable()
export class AccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get(envKey.accessTokenSecret),
    });
  }

  async validate(payload: Request) {
    return payload;
  }
}
