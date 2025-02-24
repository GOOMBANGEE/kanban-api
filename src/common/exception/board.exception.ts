import { HttpException, HttpStatus } from '@nestjs/common';

export const BOARD_ERROR = {
  BOARD_NOT_FOUND: '존재하지 않는 보드입니다',
  PERMISSION_DENIED: '권한이 없습니다',
};

export class BoardException extends HttpException {
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
