import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { VALIDATION_ERROR } from '../../common/exception/valid.exception';

export class CreateStatusDto {
  @IsNumber({}, { message: VALIDATION_ERROR.ID_ERROR })
  @IsNotEmpty({ message: VALIDATION_ERROR.ID_ERROR })
  boardId: number;

  @IsString({ message: VALIDATION_ERROR.TITLE_ERROR })
  @IsNotEmpty({ message: VALIDATION_ERROR.TITLE_ERROR })
  title: string;

  @IsString({ message: VALIDATION_ERROR.GROUP_ERROR })
  @IsNotEmpty({ message: VALIDATION_ERROR.GROUP_ERROR })
  group: string;
}
