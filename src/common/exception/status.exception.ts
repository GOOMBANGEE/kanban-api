import { HttpException, HttpStatus } from '@nestjs/common';

export const STATUS_ERROR = {
  STATUS_NOT_FOUND: '존재하지 않는 상태입니다',
  PERMISSION_DENIED: '권한이 없습니다',
};

export class StatusException extends HttpException {
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
