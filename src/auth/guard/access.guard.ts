import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// header: 'bearer accessToken'
@Injectable()
export class AccessGuard extends AuthGuard('jwt-access') {
  handleRequest(err, user) {
    if (err || !user) {
      // jwt 토큰이 없거나 오류가 있을 경우 사용자 정보를 null로 반환
      return null;
    }
    return user;
  }
}
