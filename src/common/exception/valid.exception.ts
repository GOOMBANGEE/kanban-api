import { HttpException, HttpStatus } from '@nestjs/common';

interface ValidationError {
  property: string;
  message: string;
}

export const VALIDATION_ERROR = {
  USERNAME_ERROR: '유저명 유효성 검사를 통과하지 못했습니다',
  PASSWORD_ERROR: '비밀번호 유효성 검사를 통과하지 못했습니다',
  TITLE_ERROR: '제목이 비어있습니다',
  ICON_ERROR: '허용되지 않는 이미지입니다',
  COLOR_ERROR: '허용되지 않는 색상입니다',
  DISPLAY_ORDER_ERROR: '순서값이 잘못되었습니다',
  CONTENT_ERROR: '내용이 비어있습니다',
  BOARD_ERROR: '허용되지 않는 보드입니다',
  GROUP_ERROR: '허용되지 않는 그룹입니다',
  STATUS_ERROR: '허용되지 않는 상태입니다',
  DATE_ERROR: '허용되지 않는 일정입니다',
  VALUE_INVALID: '허용되지 않는 값입니다',
};

export class ValidException extends HttpException {
  constructor(public readonly error: ValidationError[]) {
    super(ValidException.getMessage(error), HttpStatus.BAD_REQUEST);
  }

  private static getMessage(error: ValidationError[]) {
    if (!error || error.length === 0) return '알 수 없는 오류';

    // error: [ { property: 'email', message: 'VALID:EMAIL_ERROR' } ]
    const message = error[0]?.message;
    return message || '알 수 없는 오류';
  }
}
