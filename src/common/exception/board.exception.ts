import { HttpException, HttpStatus } from '@nestjs/common';

export const BOARD_ERROR = {
  BOARD_NOT_FOUND: '존재하지 않는 보드입니다',
  INVALID_CODE: '코드를 확인해주세요',
  ALREADY_PARTICIPANT: '이미 참여중인 보드입니다',
  PERMISSION_DENIED: '권한이 없습니다',
  REMAINING_USER: '남아있는 유저가 있습니다',
  REQUEST_INVALID: '유효하지않은 요청방식입니다',
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
