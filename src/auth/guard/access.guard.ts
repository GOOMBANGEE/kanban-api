import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  USER_ERROR,
  UserException,
} from '../../common/exception/user.exception';

// header: 'bearer accessToken'
@Injectable()
export class AccessGuard extends AuthGuard('jwt-access') {
  handleRequest(err, user) {
    if (err || !user) {
      // jwt 토큰이 없거나 오류가 있을 경우 에러 전달
      throw new UserException(USER_ERROR.PERMISSION_DENIED);
    }
    return user;
  }
}
