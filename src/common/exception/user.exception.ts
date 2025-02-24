import { HttpException, HttpStatus } from '@nestjs/common';

export const USER_ERROR = {
  PASSWORD_DO_NOT_MATCH: '비밀번호가 일치하지 않습니다',
  USERNAME_EXIST: '이미 존재하는 유저명입니다',
  UNREGISTERED: '유저 정보가 없습니다',
  REFRESH_TOKEN_INVALID: '토큰이 유효하지 않습니다',
  USERNAME_OR_PASSWORD_ERROR: '유저명 혹은 비밀번호가 틀렸습니다',
  PERMISSION_DENIED: '권한이 없습니다',
};

export class UserException extends HttpException {
  constructor(public readonly message: string) {
    super(
      {
        message: message || '알 수 없는 오류',
        statusCode: HttpStatus.BAD_REQUEST,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
