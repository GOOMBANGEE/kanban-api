import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { Logger } from 'winston';

// @UseGuards(LocalGuard) => LocalStrategy return user: User => auth.service.ts/login return accessToken
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    @Inject('winston') private readonly logger: Logger,
  ) {
    super({ usernameField: 'username' });
  }

  validate(username: string, password: string) {
    return this.authService.validateUser(username, password);
  }
}
