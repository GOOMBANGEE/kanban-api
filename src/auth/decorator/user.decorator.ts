import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { Socket } from 'socket.io';

export interface UserBase {
  id: string;
  username: string;
  role: string; // admin, null
}

// local guard
export interface LocalUserInfo extends UserBase {
  registerDate: Date;
  activated: boolean;
}

// jwt(access, refresh) guard
export interface JwtUserInfo extends UserBase {
  type: string; // accessToken, refreshToken
  iat: number;
  exp: number;
}

export const RequestUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request: Request = context.switchToHttp().getRequest();
    return request.user;
  },
);

export const WsUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const socket: Socket = context.switchToWs().getClient();
    return socket.data.user;
  },
);
