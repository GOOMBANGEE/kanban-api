import { IsNotEmpty, IsString } from 'class-validator';
import { VALIDATION_ERROR } from '../../common/exception/valid.exception';

export class CreateTicketDto {
  @IsNotEmpty({ message: VALIDATION_ERROR.TITLE_ERROR })
  @IsString({ message: VALIDATION_ERROR.TITLE_ERROR })
  title: string;
}
