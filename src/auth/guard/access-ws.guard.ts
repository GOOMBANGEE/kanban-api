import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { envKey } from '../../common/const/env.const';
import { ConfigService } from '@nestjs/config';
import {
  USER_ERROR,
  UserException,
} from '../../common/exception/user.exception';

@Injectable()
export class AccessWsGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const socket: Socket = context.switchToWs().getClient();
    const token = socket.handshake.headers.authorization;
    if (!token) {
      throw new UserException(USER_ERROR.PERMISSION_DENIED);
    }

    try {
      const secret = this.configService.get(envKey.accessTokenSecret);
      socket.data.user = this.jwtService.verify(
        socket.handshake.headers.authorization,
        { secret },
      );
      return true;
    } catch {
      throw new UserException(USER_ERROR.PERMISSION_DENIED);
    }
  }
}
